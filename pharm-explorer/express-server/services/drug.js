
import axios from 'axios'
import {load} from 'cheerio'
import { createCanvas, loadImage } from 'canvas'
const baseUrl='http://127.0.0.1:3001/'

const getDrugData=async(name)=>{
    return axios.get(`${baseUrl}getDrugData/${name}`)
}
const getDrugLogic=(name)=>{
    const promises=[
        axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/property/MolecularFormula,MolecularWeight,InChIKey,CanonicalSmiles/json`),
        axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/synonyms/json`),
        axios.get(`https://clinicaltrials.gov/api/v2/studies?format=json&query.intr=${name}`),
        axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/PNG?image_size=500x500`, {responseType: 'arraybuffer'}),
        axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/xrefs/PatentID/json`),
        axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/assaysummary/json`),
    ]
    return Promise.all(promises)
}
const queryPubmed=(synonyms)=>{
    const promises=[];
    const trialPromises=[];
    for (const name of synonyms){
        promises.push(
            axios.get(`https://pubmed.ncbi.nlm.nih.gov/?term=%${name}+mechanism+of+action%22%5Btiab%3A%7E0%5D+OR+%${name}+moa%22%5Btiab%3A%7E0%5D+OR+%22${name}+is+a%22%5Btiab%3A%7E0%5D&filter=simsearch1.fha&format=abstract`),
        )
        trialPromises.push(
            axios.get(`https://pubmed.ncbi.nlm.nih.gov/?term=${name}&show_snippets=off&filter=pubt.clinicaltrial&size=50`)
        )
    }
    return Promise.all(promises.concat(trialPromises))
}
const findMoa=(htmlArray, synonyms)=>{
    for (const htmlFile of htmlArray){
        const htmlContent=htmlFile.data
        const $ = load(htmlContent)
        let moa=null;
        // require the name of the compound to be capitalized
        for (const name of synonyms){
            const compoundName1=name.charAt(0).toUpperCase()+name.slice(1).toLowerCase();
            const compoundName2=name.charAt(0).toUpperCase()+name.slice(1);

            const regex=`(?:[^\n.;•]*?(\\b(?:${compoundName1}|${compoundName2})\\b).*?\\.)`
            const pattern=new RegExp(regex)
            for (let i=1;i<=5;i++){
                let abstractDiv=($(`#search-result-1-${i}-eng-abstract`))
                if (abstractDiv.length===0){
                    abstractDiv=$(`#eng-abstract`)
                }
                let anchorElement = ($(`#search-result-1-${i}-full-view-heading h1 a`));
                if (anchorElement.length===0){
                    anchorElement=$(`#full-view-heading ul li span.identifier.pmc a`)
                }
                const href = anchorElement.attr('href');
                let url= (href && href.length>10)
                ? href
                : `https://pubmed.ncbi.nlm.nih.gov${href}`
                const text = abstractDiv.find('p').text();

                let match=text.match(pattern)
                if (match){
                    moa={};
                    moa.text=match[0]
                    moa.url=url
                    return moa;
                } 
            }
        }
    }
    return null;
}
const findPubmedTrials=(htmlArray)=>{
    const trials=[];
    for (const htmlFile of htmlArray){
        const htmlContent = htmlFile.data
        const $ = load(htmlContent)
        $('article[data-rel-pos]').each((index, element) => {
            const article = $(element);
            const href = article.find('.docsum-title').attr('href');
            const text = article.find('.docsum-title').text();
            
            const url=`https://pubmed.ncbi.nlm.nih.gov${href}`
            const isDuplicate = trials.some(trial => trial.url === url || trial.text === text);

            if (!isDuplicate){
                trials.push({text, url})
            }
        });
    }
    return trials;
}
async function cropImageToCompound(inputImageData, colorTolerance) {
    try {
        const image = await loadImage(inputImageData);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
    
        // Draw the image on the canvas
        ctx.drawImage(image, 0, 0, image.width, image.height);
    
        // Get the image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageData;
    
        // Initialize crop boundaries
        let top = -1;
        let bottom = -1;
        let left = -1;
        let right = -1;
    
        // Iterate through the pixels and make white pixels transparent
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
    
            // Check if the pixel is nearly white (within the color tolerance)
            if (r >= 255 - colorTolerance && g >= 255 - colorTolerance && b >= 255 - colorTolerance) {
              // Set the alpha channel to 0 (transparent)
              data[index + 3] = 0;
            } else {
              // Update crop boundaries if it's not a white pixel
              if (top === -1) top = y;
              if (left === -1 || x < left) left = x;
              if (right === -1 || x > right) right = x;
              bottom = y;
            }
          }
        }
    
        // Crop the canvas to the non-white region
        const croppedWidth = right - left + 1;
        const croppedHeight = bottom - top + 1;
        const croppedCanvas = createCanvas(croppedWidth, croppedHeight);
        const croppedCtx = croppedCanvas.getContext('2d');
    
        // Copy the non-white region to the cropped canvas
        croppedCtx.drawImage(
          canvas,
          left,
          top,
          croppedWidth,
          croppedHeight,
          0,
          0,
          croppedWidth,
          croppedHeight
        );
    
        // Get the modified image as a Buffer with a transparent background and cropped dimensions
        const modifiedImageData = croppedCanvas.toBuffer('image/png');
    
        return modifiedImageData;
      } catch (error) {
        console.error('An error occurred:', error);
        return null;
      }
  }
export default {
    getDrugData,
    getDrugLogic,
    queryPubmed,
    findMoa,
    findPubmedTrials,
    cropImageToCompound,
}