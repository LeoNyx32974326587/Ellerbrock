(function(){
  function slugify(s){return s.trim().toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
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
      // Check if this is a team card image (inside .team-card-img or .team-card)
      var isTeamImg = !!(img.closest('.team-card-img') || img.closest('.team-card'));
      if(typeof entry === 'object'){
        if(entry.fit) img.style.objectFit = entry.fit;
        if(entry.pos) img.style.objectPosition = entry.pos;
        // Only apply size/margin for non-team images
        if(!isTeamImg){
          if(entry.w){img.style.width = entry.w; img.style.maxWidth='none';}
          if(entry.h){img.style.height = entry.h; img.style.maxHeight='none';}
          if(entry.mx) img.style.marginLeft = entry.mx+'px';
          if(entry.my) img.style.marginTop = entry.my+'px';
        }
      }
      var sib=img.nextElementSibling;
      if(sib&&sib.classList&&sib.classList.contains('initials')) sib.style.display='none';
    });
    var page=location.pathname.split('/').pop()||'index.html';
    if(map._texts){
      var pageTexts=map._texts[page];
      if(pageTexts){
        Object.keys(pageTexts).forEach(function(sel){
          try{var el=document.querySelector(sel);if(el)el.textContent=pageTexts[sel];}catch(e){}
        });
      }
    }
    if(map._content){
      Object.keys(map._content).forEach(function(key){
        document.querySelectorAll('[data-i18n="'+key+'"]').forEach(function(el){
          el.textContent=map._content[key];
        });
      });
    }
    document.querySelectorAll('.team-card-placeholder').forEach(function(ph){
      var nameEl=ph.closest('.team-card')&&ph.closest('.team-card').querySelector('.team-card-name');
      if(!nameEl)return;
      var fn='team-'+slugify(nameEl.textContent)+'.jpg';
      var entry=map[fn];
      if(!entry)return;
      var url=typeof entry==='string'?entry:entry.url;
      if(!url)return;
      var imgDiv=document.createElement('div');
      imgDiv.className='team-card-img';
      var img=document.createElement('img');
      img.src=url;img.alt=nameEl.textContent;
      img.setAttribute('data-orig',fn);
      // For team images: only apply fit and pos, not size/margin
      if(typeof entry==='object'){
        if(entry.fit)img.style.objectFit=entry.fit;
        if(entry.pos)img.style.objectPosition=entry.pos;
      }
      imgDiv.appendChild(img);
      ph.replaceWith(imgDiv);
    });
  }
  if(window.self!==window.top){
    if(window.ELLERBROCK_IMAGES) applyMap(window.ELLERBROCK_IMAGES);
    var sc=document.createElement('script');sc.src='admin-editor.js';document.head.appendChild(sc);
    return;
  }
  if(window.ELLERBROCK_IMAGES) applyMap(window.ELLERBROCK_IMAGES);
})();
