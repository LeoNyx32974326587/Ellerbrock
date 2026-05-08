(function(){
  function applyMap(map){
    if(!map||typeof map!=='object')return;
    if(Object.keys(map).length===0)return;
    document.querySelectorAll('img[src^="images/"]').forEach(function(img){
      var f=img.getAttribute('src').replace('images/','');
      if(map[f]){
        img.removeAttribute('onerror');img.onerror=null;
        img.src=map[f];img.style.display='';
        var sib=img.nextElementSibling;
        if(sib&&sib.classList&&sib.classList.contains('initials'))sib.style.display='none';
      }
    });
  }
  if(window.self!==window.top)return;
  /* Always fetch the latest image-config.js, bypassing all caches */
  fetch('https://raw.githubusercontent.com/LeoNyx32974326587/Ellerbrock/main/image-config.js?t='+Date.now())
    .then(function(r){return r.text();})
    .then(function(txt){
      try{
        var m=txt.match(/\{[\s\S]*\}/);
        if(m){var map=JSON.parse(m[0]);applyMap(map);}
      }catch(e){
        if(window.ELLERBROCK_IMAGES)applyMap(window.ELLERBROCK_IMAGES);
      }
    }).catch(function(){
      if(window.ELLERBROCK_IMAGES)applyMap(window.ELLERBROCK_IMAGES);
    });
})();
