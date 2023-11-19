function randomInteger(From,to){
  return Math.floor(Math.random() * (to - From + 1) + From);
}

function AlphaWord_Min(length){
  S = "";
  for (i=0;i<length;i++){
    S+= String.fromCharCode(randomInteger(97,122));
  }
  return S;
}
function AlphaWord_Maj(length){
  S = "";
  for (var i=0;i<length;i++){
    S+= String.fromCharCode(randomInteger(65,90));
  }
  return S;
}
function AlphaWord_Maj_Min(length){
  S = "";
  for (var i=0;i<length;i++){
    if (randomInteger(0,1) == 0){
      S += AlphaWord_Min(1);
    }else{
      S += AlphaWord_Maj(1);
    }
  }
  return S;
}
function numWord(length){
  S = "";
  for (i=0;i<length;i++){
    S+= String.fromCharCode(randomInteger(48,57));
  }
  return S;
}
function alphaNumWord_Maj(length){
  S = "";
  for (var i=0;i<length;i++){
    if (randomInteger(0,1) == 0){
      S += AlphaWord_Maj(1);
    }else{
      S += numWord(1);
    }
  }
  return S;
}
function alphaNumWord_Min(length){
  S = "";
  for (var i=0;i<length;i++){
    if (randomInteger(0,1) == 0){
      S += AlphaWord_Min(1);
    }else{
      S += numWord(1);
    }
  }
  return S;
}
function alphaNumWord_Maj_Min(length){
  S = "";
  for (var i=0;i<length;i++){
    if (randomInteger(0,1) == 0){
      S += AlphaWord_Maj_Min(1);
    }else{
      S += numWord(1);
    }
  }
  return S;
}

module.exports = {
  randomID: alphaNumWord_Maj
}