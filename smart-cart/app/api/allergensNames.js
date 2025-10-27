import allergensData from "./allergens"

function getNames(){
    var names = [];
    for (var i = 0; i < allergensData.length;i++){
        var obj = allergensData[i];
        names.push(obj.name);
    }
    return names;
}


const allergenNames = getNames();

export default allergenNames;