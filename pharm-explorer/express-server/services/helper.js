const formatDate=(date)=>{
    const parts=date.split('-')
    const year=parts[0];
    const month=parts[1];
    const day=parts[2];

    date=`${month}/${day}/${year}`;
    return date;
}
export default{
    formatDate,

}