window.ELLERBROCK_IMAGES = {
  "team-david-hintenlang.jpg": "https://res.cloudinary.com/daiiz3u5t/image/upload/v1778238378/ellerbrock/team-david-hintenlang.webp",
  "team-joerg-raphael.jpg": "https://res.cloudinary.com/daiiz3u5t/image/upload/v1778238396/ellerbrock/team-joerg-raphael.webp",
  "team-fabian-habel.jpg": "https://res.cloudinary.com/daiiz3u5t/image/upload/v1778238403/ellerbrock/team-fabian-habel.webp",
  "dolmetscheranlage-einsatz.jpg": "https://res.cloudinary.com/daiiz3u5t/image/upload/v1778238769/ellerbrock/dolmetscheranlage-einsatz.jpg",
  "galerie-1.jpg": "https://res.cloudinary.com/daiiz3u5t/image/upload/v1778248772/ellerbrock/galerie-1-1778248771364.webp"
};

(function(){
  function applyMap(map){
    if(!map||typeof map!=='object')return;
    if(Object.keys(map).length===0)return;
    document.querySelectorAll('img[src^="images/"]').forEach(function(img){
      var f=img.getAttribute('src').replace('images/','');
      if(map[f]){
        img.removeAttribute('onerror');
        img.onerror=null;
        img.src=map[f];
        img.style.display='';
        var sib=img.nextElementSibling;
        if(sib&&sib.classList&&sib.classList.contains('initials'))sib.style.display='none';
      }
    });
  }
  function run(){
    if(window.self!==window.top)return;
    applyMap(window.ELLERBROCK_IMAGES);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',run);
  }else{
    run();
  }
})();
