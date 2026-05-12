(function(){
  function slugify(s){return s.trim().toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}
  function getInitials(name){return name.split(' ').map(function(w){return w[0]||''}).join('').toUpperCase().substring(0,2);}

  document.querySelectorAll('img[src^="images/"]').forEach(function(img){
    img.setAttribute('data-orig', img.getAttribute('src').replace('images/',''));
  });

  function applyMap(map){
    if(!map||typeof map!=='object')return;
    if(Object.keys(map).length===0)return;

    // Apply image replacements
    document.querySelectorAll('img[data-orig], img[src^="images/"]').forEach(function(img){
      var f = img.getAttribute('data-orig') || img.getAttribute('src').replace('images/','');
      var entry = map[f];
      if(!entry) return;
      var url = typeof entry === 'string' ? entry : entry.url;
      if(!url) return;
      img.removeAttribute('onerror'); img.onerror=null;
      img.src=url; img.style.display='';
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

    // Apply text overrides
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

    // Dynamic team rendering from _team data
    if(map._team&&map._team.length>0){
      var teamSection=document.querySelector('.team-section .container');
      if(teamSection){
        // Keep header elements
        var label=teamSection.querySelector('.section-label');
        var title=teamSection.querySelector('.section-title');
        var subtitle=teamSection.querySelector('.section-subtitle');

        // Remove old department divs
        teamSection.querySelectorAll('.team-dept').forEach(function(d){d.remove();});

        // Update subtitle count
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

            var fn='team-'+slugify(m.name)+'.jpg';
            var imgEntry=map[fn];
            var photoUrl=m.photo||(imgEntry?(typeof imgEntry==='string'?imgEntry:imgEntry.url):'');

            if(photoUrl){
              var imgDiv=document.createElement('div');
              imgDiv.className='team-card-img';
              var img=document.createElement('img');
              img.src=photoUrl;
              img.alt=m.name;
              img.setAttribute('data-orig',fn);
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
      // Fallback: replace placeholders with uploaded images (legacy support)
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
        if(typeof entry==='object'){
          if(entry.fit)img.style.objectFit=entry.fit;
          if(entry.pos)img.style.objectPosition=entry.pos;
        }
        imgDiv.appendChild(img);
        ph.replaceWith(imgDiv);
      });
    }
  }

  if(window.self!==window.top){
    if(window.ELLERBROCK_IMAGES) applyMap(window.ELLERBROCK_IMAGES);
    var sc=document.createElement('script');sc.src='admin-editor.js';document.head.appendChild(sc);
    return;
  }
  if(window.ELLERBROCK_IMAGES) applyMap(window.ELLERBROCK_IMAGES);
})();
