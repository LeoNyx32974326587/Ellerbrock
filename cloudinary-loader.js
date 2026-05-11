(function(){
  document.querySelectorAll('img[src^="images/"]').forEach(function(img){
    img.setAttribute('data-orig', img.getAttribute('src').replace('images/',''));
  });
  function applyMap(map){
    if(!map||typeof map!=='object')return;
    if(Object.keys(map).length===0)return;
    document.querySelectorAll('img[data-orig], img[src^="images/"]').forEach(function(img){
      var f = img.getAttribute('data-orig') || img.getAttribute('src').replace('images/','');
      var entry = map[f];
      if(!entry) return;
      var url = typeof entry === 'string' ? entry : entry.url;
      if(!url) return;
      img.removeAttribute('onerror'); img.onerror=null;
      img.src=url; img.style.display='';
      if(!img.getAttribute('data-orig')) img.setAttribute('data-orig', f);
      if(typeof entry === 'object'){
        if(entry.fit) img.style.objectFit = entry.fit;
        if(entry.pos) img.style.objectPosition = entry.pos;
        if(entry.w){img.style.width = entry.w; img.style.maxWidth='none';}
        if(entry.h){img.style.height = entry.h; img.style.maxHeight='none';}
        if(entry.mx) img.style.marginLeft = entry.mx+'px';
        if(entry.my) img.style.marginTop = entry.my+'px';
      }
      var sib=img.nextElementSibling;
      if(sib&&sib.classList&&sib.classList.contains('initials')) sib.style.display='none';
    });
    // Restore new containers
    var page=location.pathname.split('/').pop()||'index.html';
    Object.keys(map).forEach(function(fn){
      if(!fn.startsWith('_new_'))return;
      var entry=map[fn];if(!entry||!entry.url)return;
      if(entry.page&&entry.page!==page)return;
      var div=document.createElement('div');
      div.style.cssText='position:relative;margin:10px auto;overflow:hidden;';
      if(entry.w)div.style.width=entry.w;
      if(entry.h)div.style.height=entry.h;
      var nimg=document.createElement('img');nimg.src=entry.url;
      nimg.style.width='100%';nimg.style.height='100%';