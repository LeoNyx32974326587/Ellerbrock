(function(){
  document.querySelectorAll('img[src^="images/"]').forEach(function(img){
    img.setAttribute('data-orig', img.getAttribute('src').replace('images/',''));
  });

  function applyMap(map){
    if(!map||typeof map!=='object')return;
    if(Object.keys(map).length===0)return;
    document.querySelectorAll('img[data-orig], img[src^="images/"]').forEach(function(img){
      var f = img.getAttribute('data-orig') || img.getAttribute('src').replace('images/','');
      if(map[f]){
        img.removeAttribute('onerror'); img.onerror=null;
        img.src=map[f]; img.style.display='';
        if(!img.getAttribute('data-orig')) img.setAttribute('data-orig', f);
        var sib=img.nextElementSibling;
        if(sib&&sib.classList&&sib.classList.contains('initials')) sib.style.display='none';
      }
    });
  }
  if(window.self!==window.top)return;

  /* Fetch via GitHub API (always fresh, no CDN cache) */
  fetch('https://api.github.com/repos/LeoNyx32974326587/Ellerbrock/contents/image-config.js',{
    headers:{'Accept':'application/vnd.github.v3.raw'}
  })
    .then(function(r){return r.ok?r.text():null;})
    .then(function(txt){
      if(!txt)return;
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
