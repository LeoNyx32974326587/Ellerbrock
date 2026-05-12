/* Ellerbrock Admin Visual Editor v4 - Team editing moved to Admin Panel */
(function(){
  if(window.self===window.top)return;

  var map={},currentPage='',selectedWrap=null;
  var CLOUDINARY_URL='https://api.cloudinary.com/v1_1/daiiz3u5t/image/upload';
  var UPLOAD_PRESET='ellerbrock';
  var _pendingFn=null;
  var _fileInput=document.createElement('input');
  _fileInput.type='file';_fileInput.accept='image/*';_fileInput.style.display='none';
  var _fileInputReady=false;
  function ensureFileInput(){if(!_fileInputReady&&document.body){document.body.appendChild(_fileInput);_fileInputReady=true;}}
  _fileInput.addEventListener('change',function(){
    console.log('[AE] file change, files:', this.files?this.files.length:0, 'pending:', _pendingFn);
    if(!this.files||!this.files[0]||!_pendingFn){console.log('[AE] abort: no file or no pending');return;}
    var file=this.files[0],fn=_pendingFn;
    _pendingFn=null;
    if(file.size>10*1024*1024){alert('Max 10 MB');return;}
    console.log('[AE] uploading',fn,'size:',file.size);
    var fd=new FormData();
    fd.append('file',file);
    fd.append('upload_preset',UPLOAD_PRESET);
    fd.append('public_id','ellerbrock/'+fn.replace('.jpg','').replace('.png','').replace('.webp','')+'-'+Date.now());
    fetch(CLOUDINARY_URL,{method:'POST',body:fd})
      .then(function(r){console.log('[AE] cloudinary status:',r.status);return r.json();})
      .then(function(data){
        console.log('[AE] cloudinary response:',data.secure_url||data.error);
        if(data.secure_url){
          var img=document.querySelector('img[data-ae-fn="'+fn+'"]');
          console.log('[AE] found img for',fn,':',!!img);
          if(img){img.src=data.secure_url;img.style.display='';}
          msg({type:'admin-uploaded',filename:fn,url:data.secure_url});
        }else{
          console.error('[AE] upload error:',data.error);
        }
      }).catch(function(err){console.error('[AE] fetch error:',err);alert('Upload fehlgeschlagen: '+err.message);});
    this.value='';
  });

  var css=document.createElement('style');
  css.textContent=[
    '.preloader,.scroll-progress,.grain-overlay,.cursor-glow,.ticker-banner{display:none!important;}',
    'body{overflow:auto!important;}',
    '.ae-wrap{position:relative;display:inline-block;overflow:visible;}',
    '.ae-handles{position:absolute;pointer-events:none;z-index:150;border:2px solid #3b82f6;opacity:0;transition:opacity .15s;box-sizing:border-box;}',
    '.ae-wrap:hover .ae-handles,.ae-wrap.ae-sel .ae-handles{opacity:1;}',
    '.ae-h{position:absolute;width:12px;height:12px;background:#3b82f6;border:2px solid #fff;border-radius:50%;pointer-events:all;z-index:151;box-shadow:0 1px 4px rgba(0,0,0,.4);}',
    '.ae-h-tl{top:-6px;left:-6px;cursor:nwse-resize;}.ae-h-tr{top:-6px;right:-6px;cursor:nesw-resize;}',
    '.ae-h-bl{bottom:-6px;left:-6px;cursor:nesw-resize;}.ae-h-br{bottom:-6px;right:-6px;cursor:nwse-resize;}',
    '.ae-tb{position:absolute;top:8px;right:8px;display:flex;gap:4px;background:rgba(0,0,0,.85);border-radius:8px;padding:4px 8px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;z-index:160;}',
    '.ae-wrap:hover .ae-tb,.ae-wrap.ae-sel .ae-tb{opacity:1;pointer-events:all;}',
    '.ae-btn{background:none;border:none;color:#fff;font-size:12px;cursor:pointer;padding:3px 8px;border-radius:4px;font-weight:600;}',
    '.ae-btn:hover{background:rgba(255,255,255,.15);}',
    '.ae-move{cursor:move;position:absolute;z-index:149;}',
    '.ae-fab{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:9999;}',
    '.ae-fab-btn{width:44px;height:44px;border-radius:50%;color:#fff;font-size:22px;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;}',
    '.ae-fab-btn:hover{transform:scale(1.1);}',
    '.ae-ctx{position:fixed;background:#1e293b;border:1px solid #334155;border-radius:10px;padding:6px 0;z-index:9000;min-width:180px;box-shadow:0 8px 24px rgba(0,0,0,.4);}',
    '.ae-ctx-item{padding:8px 16px;color:#e2e8f0;font-size:13px;cursor:pointer;display:block;}',
    '.ae-ctx-item:hover{background:#334155;}',
    '.ae-ctx-sep{height:1px;background:#334155;margin:4px 0;}',
    '.ae-editable{outline:none;cursor:text;border-radius:2px;transition:box-shadow .15s;}',
    '.ae-editable:hover{box-shadow:0 0 0 2px rgba(59,130,246,0.4);}',
    '.ae-editable:focus{box-shadow:0 0 0 2px #3b82f6;}',
    '.ae-new-container{position:relative;margin:10px auto;border:2px dashed #3b82f6;border-radius:8px;overflow:hidden;background:rgba(59,130,246,0.05);display:flex;align-items:center;justify-content:center;cursor:pointer;min-height:100px;}',
    '.ae-new-container:hover{background:rgba(59,130,246,0.1);}',
    '.ae-new-container img{width:100%;height:100%;object-fit:cover;}'
  ].join('\n');
  document.head.appendChild(css);

  function msg(data){window.parent.postMessage(data,'*');}
  function syncRect(img,el){
    var ml=parseInt(img.style.marginLeft)||0;
    var mt=parseInt(img.style.marginTop)||0;
    el.style.width=img.offsetWidth+'px';
    el.style.height=img.offsetHeight+'px';
    el.style.left=ml+'px';
    el.style.top=mt+'px';
  }
  function deselect(){if(selectedWrap){selectedWrap.classList.remove('ae-sel');selectedWrap=null;}}
  function select(wrap){deselect();wrap.classList.add('ae-sel');selectedWrap=wrap;}

  function showCtx(x,y,items){
    closeCtx();
    var m=document.createElement('div');m.className='ae-ctx';m.id='ae-ctx';
    m.style.left=x+'px';m.style.top=y+'px';
    items.forEach(function(it){
      if(it==='---'){var s=document.createElement('div');s.className='ae-ctx-sep';m.appendChild(s);return;}
      var el=document.createElement('div');el.className='ae-ctx-item';el.textContent=it.label;
      el.addEventListener('click',function(ev){ev.stopPropagation();closeCtx();it.action();});
      m.appendChild(el);
    });
    document.body.appendChild(m);
    var r=m.getBoundingClientRect();
    if(r.right>window.innerWidth)m.style.left=(x-r.width)+'px';
    if(r.bottom>window.innerHeight)m.style.top=(y-r.height)+'px';
    setTimeout(function(){document.addEventListener('click',closeCtx,{once:true});},10);
  }
  function closeCtx(){var m=document.getElementById('ae-ctx');if(m)m.remove();}

  function setupMove(moveEl,img,fn,syncFn){
    var sx,sy,ox,oy;
    moveEl.addEventListener('mousedown',function(e){
      e.preventDefault();e.stopPropagation();
      sx=e.clientX;sy=e.clientY;
      ox=parseInt(img.style.marginLeft)||0;oy=parseInt(img.style.marginTop)||0;
      select(moveEl.closest('.ae-wrap'));
      function onM(ev){img.style.marginLeft=(ox+ev.clientX-sx)+'px';img.style.marginTop=(oy+ev.clientY-sy)+'px';if(syncFn)syncFn();}
      function onU(){document.removeEventListener('mousemove',onM);document.removeEventListener('mouseup',onU);msg({type:'admin-settings',filename:fn,mx:parseInt(img.style.marginLeft)||0,my:parseInt(img.style.marginTop)||0});}
      document.addEventListener('mousemove',onM);document.addEventListener('mouseup',onU);
    });
    moveEl.addEventListener('click',function(e){e.stopPropagation();select(moveEl.closest('.ae-wrap'));});
  }

  function setupResize(h,img,fn,corner,syncFn){
    h.addEventListener('mousedown',function(e){
      e.preventDefault();e.stopPropagation();
      var sx=e.clientX,sy=e.clientY,ow=img.offsetWidth,oh=img.offsetHeight;
      select(h.closest('.ae-wrap'));
      function onM(ev){
        var dx=ev.clientX-sx,dy=ev.clientY-sy,nw=ow,nh=oh;
        if(corner==='br'){nw=ow+dx;nh=oh+dy;}else if(corner==='bl'){nw=ow-dx;nh=oh+dy;}
        else if(corner==='tr'){nw=ow+dx;nh=oh-dy;}else if(corner==='tl'){nw=ow-dx;nh=oh-dy;}
        if(nw<40)nw=40;if(nh<40)nh=40;
        img.style.width=nw+'px';img.style.height=nh+'px';img.style.maxWidth='none';img.style.maxHeight='none';
        if(syncFn)syncFn();
      }
      function onU(){document.removeEventListener('mousemove',onM);document.removeEventListener('mouseup',onU);msg({type:'admin-settings',filename:fn,w:img.style.width,h:img.style.height});}
      document.addEventListener('mousemove',onM);document.addEventListener('mouseup',onU);
    });
  }

  function setupImage(img,fn,entry){
    var url=(typeof entry==='object')?(entry&&entry.url):entry;
    var p=img.parentElement;if(!p)return;
    // Skip team card images - managed in admin panel
    if(img.closest('.team-card-img')||img.closest('.team-card'))return;

    var wrap=document.createElement('div');wrap.className='ae-wrap';
    p.insertBefore(wrap,img);wrap.appendChild(img);

    if(typeof entry==='object'){
      if(entry.fit)img.style.objectFit=entry.fit;
      if(entry.pos)img.style.objectPosition=entry.pos;
      if(entry.w){img.style.width=entry.w;img.style.maxWidth='none';}
      if(entry.h){img.style.height=entry.h;img.style.maxHeight='none';}
      if(entry.mx)img.style.marginLeft=entry.mx+'px';
      if(entry.my)img.style.marginTop=entry.my+'px';
    }

    var hd=document.createElement('div');hd.className='ae-handles';
    ['tl','tr','bl','br'].forEach(function(c){
      var dot=document.createElement('div');dot.className='ae-h ae-h-'+c;
      hd.appendChild(dot);
      setupResize(dot,img,fn,c,function(){syncRect(img,hd);syncRect(img,mv);});
    });
    wrap.appendChild(hd);

    var mv=document.createElement('div');mv.className='ae-move';
    setupMove(mv,img,fn,function(){syncRect(img,hd);syncRect(img,mv);});
    wrap.appendChild(mv);

    function doSync(){syncRect(img,hd);syncRect(img,mv);}
    img.addEventListener('load',doSync);
    setTimeout(doSync,50);setTimeout(doSync,200);
    if(window.ResizeObserver)new ResizeObserver(doSync).observe(img);

    var tb=document.createElement('div');tb.className='ae-tb';
    var fitBtn=document.createElement('button');fitBtn.className='ae-btn';
    fitBtn.textContent=(typeof entry==='object'&&entry.fit)||'cover';
    fitBtn.addEventListener('click',function(ev){
      ev.stopPropagation();
      var fits=['cover','contain','fill','none'];
      var i=fits.indexOf(img.style.objectFit||'cover');
      var next=fits[(i+1)%fits.length];
      img.style.objectFit=next;fitBtn.textContent=next;
      msg({type:'admin-settings',filename:fn,fit:next});
    });
    tb.appendChild(fitBtn);

    var upBtn=document.createElement('button');upBtn.className='ae-btn';
    upBtn.textContent=url?'Ersetzen':'Upload';upBtn.style.color='#4ade80';
    upBtn.addEventListener('click',function(ev){ev.stopPropagation();console.log('[AE] upload click for:',fn);_pendingFn=fn;ensureFileInput();_fileInput.click();});
    tb.appendChild(upBtn);

    var delBtn=document.createElement('button');delBtn.className='ae-btn';
    delBtn.textContent='✕';delBtn.style.color='#f87171';delBtn.title='Bild löschen';
    delBtn.addEventListener('click',function(ev){ev.stopPropagation();msg({type:'admin-delete',filename:fn});});
    tb.appendChild(delBtn);

    var resetBtn=document.createElement('button');resetBtn.className='ae-btn';
    resetBtn.textContent='↺';resetBtn.title='Zurücksetzen';
    resetBtn.addEventListener('click',function(ev){
      ev.stopPropagation();
      img.style.width='';img.style.height='';img.style.marginLeft='';img.style.marginTop='';
      img.style.objectFit='';img.style.objectPosition='';img.style.maxWidth='';img.style.maxHeight='';
      msg({type:'admin-settings',filename:fn,fit:'cover',pos:'center',w:'',h:'',mx:0,my:0});
      doSync();
    });
    tb.appendChild(resetBtn);
    wrap.appendChild(tb);
    img.setAttribute('data-ae-fn',fn);
    return wrap;
  }

  function isLeafText(el){
    var dominated=['a','button','img','ul','ol','div','nav','section','form','input','select','iframe','table','svg'];
    for(var i=0;i<el.children.length;i++){
      var tag=el.children[i].tagName.toLowerCase();
      if(dominated.indexOf(tag)!==-1)return false;
    }
    return true;
  }
  function setupTexts(){
    var textEls=document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,td,th,label,blockquote,div[data-i18n]');
    textEls.forEach(function(el){
      if(el.closest('.ae-wrap,.ae-tb,.ae-fab,.ae-ctx,.ae-handles'))return;
      if(el.closest('nav,footer,.hero-stat,.stat-block,.hero-stats,.cookie-banner'))return;
      // Skip team cards - managed in admin panel
      if(el.closest('.team-card'))return;
      if(!isLeafText(el))return;
      if(!el.textContent.trim())return;
      if(/^\d[\d.,]*\+?$/.test(el.textContent.trim())&&!el.hasAttribute('data-i18n'))return;

      el.classList.add('ae-editable');
      el.setAttribute('contenteditable','true');
      el.setAttribute('spellcheck','false');

      var sel=getSelector(el);
      el.setAttribute('data-ae-sel',sel);

      var savedTexts=map._texts||{};
      var pageTexts=savedTexts[currentPage]||{};
      if(pageTexts[sel]!==undefined)el.textContent=pageTexts[sel];

      el.addEventListener('blur',function(){msg({type:'admin-text',page:currentPage,selector:sel,text:el.textContent});});
      el.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();el.blur();}});
    });
  }

  function getSelector(el){
    var path=[];var node=el;
    while(node&&node!==document.body){
      var tag=node.tagName.toLowerCase();var idx=0;var sib=node.previousElementSibling;
      while(sib){if(sib.tagName===node.tagName)idx++;sib=sib.previousElementSibling;}
      path.unshift(tag+(idx>0?':nth-of-type('+(idx+1)+')':''));
      node=node.parentElement;
    }
    return path.join('>');
  }

  window.addEventListener('message',function(e){
    var d=e.data;if(!d)return;

    if(d.type==='admin-init'){
      map=d.map||{};
      currentPage=d.page||'';
      setupTexts();

      // Find ALL images: both unloaded (src=images/) and already loaded by cloudinary-loader (data-orig)
      document.querySelectorAll('img[data-orig], img[src^="images/"]').forEach(function(img){
        if(img.closest('.ae-wrap'))return; // already wrapped
        var fn=img.getAttribute('data-orig')||img.getAttribute('src').replace('images/','');
        if(!fn||fn.indexOf('/')!==-1)return; // skip external URLs
        var entry=map[fn];
        var url=(typeof entry==='object')?(entry&&entry.url):entry;
        img.removeAttribute('onerror');img.onerror=null;
        if(url){
          img.src=url;img.style.display='';
        }else{
          // No entry in admin map = image was deleted, reset to placeholder
          img.src='images/'+fn;
        }
        if(!img.getAttribute('data-orig'))img.setAttribute('data-orig',fn);
        var nx=img.nextElementSibling;
        if(nx&&nx.classList&&nx.classList.contains('initials'))nx.style.display='none';
        setupImage(img,fn,entry||{});
      });

      document.querySelectorAll('a').forEach(function(a){
        a.setAttribute('data-href',a.getAttribute('href')||'');
        a.removeAttribute('href');a.removeAttribute('target');a.style.cursor='default';
      });

      document.addEventListener('click',function(e){
        if(!e.target.closest('.ae-wrap,.ae-ctx,.ae-fab'))deselect();
      });
    }

    if(d.type==='admin-update-image'&&d.filename&&d.url){
      document.querySelectorAll('img[data-ae-fn]').forEach(function(img){
        if(img.getAttribute('data-ae-fn')===d.filename){img.src=d.url;img.style.display='';}
      });
    }
  });
})();
