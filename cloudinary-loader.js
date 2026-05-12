(function(){
  function slugify(s){return s.trim().toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
  function getInitials(name){return name.split(' ').map(function(w){return w[0]||''}).join('').toUpperCase().substring(0,2);}

  document.querySelectorAll('img[src^="images/"]').forEach(function(img){
    img.setAttribute('data-orig', img.getAttribute('src').replace('images/',''));
  });

  /* ---- Team Popup ---- */
  function injectTeamPopup(){
    if(document.getElementById('teamPopupOverlay'))return;
    var css=document.createElement('style');
    css.textContent=[
      '.team-popup-overlay{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s ease;padding:20px;}',
      '.team-popup-overlay.visible{opacity:1;pointer-events:auto;}',
      '.team-popup{background:white;border-radius:20px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;transform:translateY(20px) scale(0.97);transition:transform 0.3s cubic-bezier(.4,0,.2,1);}',
      '.team-popup-overlay.visible .team-popup{transform:translateY(0) scale(1);}',
      '.team-popup-photo{width:100%;aspect-ratio:1;overflow:hidden;background:linear-gradient(135deg,var(--teal,#01566d),var(--primary,#003366));display:flex;align-items:center;justify-content:center;}',
      '.team-popup-photo img{width:100%;height:100%;object-fit:cover;}',
      '.team-popup-photo .popup-initials{font-size:4rem;font-weight:800;color:white;}',
      '.team-popup-body{padding:28px 24px 24px;text-align:center;}',
      '.team-popup-name{font-size:1.25rem;font-weight:700;color:#1a1a2e;margin-bottom:4px;}',
      '.team-popup-role{font-size:0.9rem;color:#01566d;font-weight:600;margin-bottom:16px;}',
      '.team-popup-desc{font-size:0.9rem;color:#555;line-height:1.7;text-align:left;padding:16px;background:#f8f9fa;border-radius:12px;margin-bottom:16px;}',
      '.team-popup-close{display:inline-flex;align-items:center;justify-content:center;padding:10px 28px;border-radius:10px;border:none;background:#f0f0f0;color:#333;font-size:0.88rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;}',
      '.team-popup-close:hover{background:#e0e0e0;}',
      'body.dark .team-popup{background:#1a1a2e;box-shadow:0 20px 60px rgba(0,0,0,0.6);}',
      'body.dark .team-popup-name{color:#e8e8f0;}',
      'body.dark .team-popup-role{color:#4ecdc4;}',
      'body.dark .team-popup-desc{color:#b0b0c0;background:#12121e;border:1px solid rgba(255,255,255,0.08);}',
      'body.dark .team-popup-close{background:#2a2a3e;color:#d0d0e0;}',
      'body.dark .team-popup-close:hover{background:#3a3a50;}',
      '@media(max-width:480px){.team-popup{max-width:calc(100vw - 40px);}.team-popup-body{padding:20px 16px 16px;}}'
    ].join('\n');
    document.head.appendChild(css);

    var overlay=document.createElement('div');
    overlay.className='team-popup-overlay';
    overlay.id='teamPopupOverlay';
    overlay.innerHTML='<div class="team-popup" id="teamPopup"></div>';
    overlay.addEventListener('click',function(e){
      if(e.target===overlay)closeTeamPopup();
    });
    document.body.appendChild(overlay);
  }

  function showTeamPopup(member,map){
    injectTeamPopup();
    var fn='team-'+slugify(member.name)+'.jpg';
    var imgEntry=map[fn];
    var photoUrl=member.photo||(imgEntry?(typeof imgEntry==='string'?imgEntry:imgEntry.url):'');
    var popup=document.getElementById('teamPopup');
    var html='';
    html+='<div class="team-popup-photo">';
    if(photoUrl){html+='<img src="'+photoUrl+'" alt="'+member.name+'">';}
    else{html+='<span class="popup-initials">'+getInitials(member.name)+'</span>';}
    html+='</div>';
    html+='<div class="team-popup-body">';
    html+='<div class="team-popup-name">'+member.name+'</div>';
    html+='<div class="team-popup-role">'+member.role+'</div>';
    if(member.desc)html+='<div class="team-popup-desc">'+member.desc+'</div>';
    html+='<button class="team-popup-close" onclick="document.getElementById(\'teamPopupOverlay\').classList.remove(\'visible\')">Schließen</button>';
    html+='</div>';
    popup.innerHTML=html;
    document.getElementById('teamPopupOverlay').classList.add('visible');
  }

  function closeTeamPopup(){
    var o=document.getElementById('teamPopupOverlay');
    if(o)o.classList.remove('visible');
  }

  // Escape key closes popup
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeTeamPopup();});

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
      var _pip=img.closest('.page-img-placeholder');if(_pip)_pip.style.display='';
      if(!img.getAttribute('data-orig')) img.setAttribute('data-orig', f);
      var isTeamImg = !!(img.closest('.team-card-img') || img.closest('.team-card'));
      if(typeof entry === 'object'){
        if(entry.fit) img.style.objectFit = entry.fit;
        if(entry.pos) img.style.objectPosition = entry.pos;
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

    // Dynamic team rendering
    if(map._team&&map._team.length>0){
      var teamSection=document.querySelector('.team-section .container');
      if(teamSection){
        var subtitle=teamSection.querySelector('.section-subtitle');
        teamSection.querySelectorAll('.team-dept').forEach(function(d){d.remove();});
        if(subtitle)subtitle.textContent='Über '+map._team.length+' engagierte Mitarbeiter sorgen dafür, dass Ihre Veranstaltung perfekt wird.';

        var depts=['Büro & Verwaltung','Technik','Versand & Logistik','Fuhrpark','Auszubildende'];
        depts.forEach(function(dept){
          var members=map._team.filter(function(m){return m.dept===dept;});
          if(members.length===0)return;

          var deptDiv=document.createElement('div');
          deptDiv.className='team-dept';
          var deptTitle=document.createElement('div');
          deptTitle.className='team-dept-title';
          deptTitle.textContent=dept;
          deptDiv.appendChild(deptTitle);

          var grid=document.createElement('div');
          grid.className='team-grid';

          members.forEach(function(m){
            var card=document.createElement('div');
            card.className='team-card fade-up visible';
            // Make clickable if has description
            if(m.desc){
              card.style.cursor='pointer';
              card.addEventListener('click',function(){showTeamPopup(m,map);});
            }

            var fn='team-'+slugify(m.name)+'.jpg';
            var imgEntry=map[fn];
            var photoUrl=m.photo||(imgEntry?(typeof imgEntry==='string'?imgEntry:imgEntry.url):'');

            if(photoUrl){
              var imgDiv=document.createElement('div');
              imgDiv.className='team-card-img';
              var img=document.createElement('img');
              img.src=photoUrl;img.alt=m.name;img.setAttribute('data-orig',fn);
              imgDiv.appendChild(img);
              card.appendChild(imgDiv);
            }else{
              var ph=document.createElement('div');
              ph.className='team-card-placeholder';
              ph.textContent=getInitials(m.name);
              card.appendChild(ph);
            }

            var info=document.createElement('div');
            info.className='team-card-info';
            var nameEl=document.createElement('div');
            nameEl.className='team-card-name';
            nameEl.textContent=m.name;
            info.appendChild(nameEl);
            var roleEl=document.createElement('div');
            roleEl.className='team-card-role';
            roleEl.textContent=m.role;
            info.appendChild(roleEl);
            card.appendChild(info);
            grid.appendChild(card);
          });

          deptDiv.appendChild(grid);
          teamSection.appendChild(deptDiv);
        });
      }
    }else{
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
        img.src=url;img.alt=nameEl.textContent;img.setAttribute('data-orig',fn);
        if(typeof entry==='object'){if(entry.fit)img.style.objectFit=entry.fit;if(entry.pos)img.style.objectPosition=entry.pos;}
        imgDiv.appendChild(img);
        ph.replaceWith(imgDiv);
      });
    }
  }


    // Hide empty page image containers, show ones with loaded images
    document.querySelectorAll('.page-img-row, .page-img-half').forEach(function(row){
      var children=row.querySelectorAll('.page-img-placeholder');
      var anyVisible=false;
      children.forEach(function(c){if(c.style.display!=='none')anyVisible=true;});
      if(!anyVisible)row.style.display='none';
    });

    if(window.self!==window.top){
    if(window.ELLERBROCK_IMAGES) applyMap(window.ELLERBROCK_IMAGES);
    var sc=document.createElement('script');sc.src='admin-editor.js';document.head.appendChild(sc);
    return;
  }
  if(window.ELLERBROCK_IMAGES) applyMap(window.ELLERBROCK_IMAGES);

  // Bind popups to Geschäftsleitung cards with data-gl-desc
  document.querySelectorAll('.team-card[data-gl-desc]').forEach(function(card){
    card.style.cursor='pointer';
    card.addEventListener('click',function(){
      var nameEl=card.querySelector('.team-card-name')||card.querySelector('h4');
      var roleEl=card.querySelector('.team-card-role')||card.querySelector('.team-role');
      var imgEl=card.querySelector('.team-card-img img')||card.querySelector('.team-avatar img');
      var member={
        name:nameEl?nameEl.textContent:'',
        role:roleEl?roleEl.textContent:'',
        desc:card.getAttribute('data-gl-desc'),
        photo:imgEl?imgEl.src:''
      };
      showTeamPopup(member,window.ELLERBROCK_IMAGES||{});
    });
  });
})();
