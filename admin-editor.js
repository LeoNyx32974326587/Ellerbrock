/* Ellerbrock Admin Visual Editor - loaded inside admin preview iframe */
(function(){
  if(window.self===window.top)return; // only run in iframe

  var map={};
  var dirty=false;
  var currentPage='';

  /* ---- CSS ---- */
  var css=document.createElement('style');
  css.textContent=`
    .ae-wrap{position:relative;display:inline-block;}
    .ae-handles{position:absolute;inset:0;pointer-events:none;z-index:150;border:2px solid #3b82f6;opacity:0;transition:opacity .15s;}
    .ae-wrap:hover .ae-handles,.ae-wrap.ae-selected .ae-handles{opacity:1;}
    .ae-h{position:absolute;width:12px;height:12px;background:#3b82f6;border:2px solid #fff;border-radius:50%;pointer-events:all;cursor:nwse-resize;z-index:151;box-shadow:0 1px 4px rgba(0,0,0,.4);}
    .ae-h-tl{top:-6px;left:-6px;cursor:nwse-resize;}
    .ae-h-tr{top:-6px;right:-6px;cursor:nesw-resize;}
    .ae-h-bl{bottom:-6px;left:-6px;cursor:nesw-resize;}
    .ae-h-br{bottom:-6px;right:-6px;cursor:nwse-resize;}
    .ae-toolbar{position:absolute;top:8px;right:8px;display:flex;gap:4px;background:rgba(0,0,0,.85);border-radius:8px;padding:4px 8px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s;z-index:160;}
    .ae-wrap:hover .ae-toolbar,.ae-wrap.ae-selected .ae-toolbar{opacity:1;pointer-events:all;}
    .ae-btn{background:none;border:none;color:#fff;font-size:12px;cursor:pointer;padding:3px 8px;border-radius:4px;font-weight:600;}
    .ae-btn:hover{background:rgba(255,255,255,.15);}
    .ae-btn-del{color:#f87171;}
    .ae-btn-add{color:#4ade80;}
    .ae-move{cursor:move;position:absolute;inset:0;z-index:149;}
    .ae-add-float{position:fixed;bottom:20px;right:20px;width:50px;height:50px;border-radius:50%;background:#3b82f6;color:#fff;font-size:28px;border:none;cursor:pointer;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;line-height:1;}
    .ae-add-float:hover{background:#2563eb;transform:scale(1.1);}
    .ae-ctx{position:absolute;background:#1e293b;border:1px solid #334155;border-radius:10px;padding:6px 0;z-index:200;min-width:160px;box-shadow:0 8px 24px rgba(0,0,0,.4);}
    .ae-ctx-item{padding:8px 16px;color:#e2e8f0;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:8px;}
    .ae-ctx-item:hover{background:#334155;}
    .ae-ctx-sep{height:1px;background:#334155;margin:4px 0;}
    .ae-new-img{position:absolute;z-index:50;border:2px dashed #3b82f6;border-radius:8px;overflow:hidden;background:rgba(0,0,0,.05);min-width:60px;min-height:60px;}
    .ae-new-img img{width:100%;height:100%;object-fit:cover;}
  `;
  document.head.appendChild(css);

  /* ---- Helper: send update to parent ---- */
  function sendUpdate(fn,data){
    window.parent.postMessage(Object.assign({type:'admin-settings',filename:fn},data),'*');
    dirty=true;
  }
  function sendDelete(fn){
    window.parent.postMessage({type:'admin-delete',filename:fn},'*');
  }
  function sendUpload(fn){
    window.parent.postMessage({type:'admin-upload',filename:fn},'*');
  }
  function sendNewContainer(data){
    window.parent.postMessage(Object.assign({type:'admin-new-container'},data),'*');
  }
  function sendDeleteContainer(fn){
    window.parent.postMessage({type:'admin-delete-container',filename:fn},'*');
  }

  /* ---- Make element draggable for move ---- */
  function makeDraggable(el,img,fn,entry){
    var startX,startY,origX,origY;
    el.addEventListener('mousedown',function(e){
      e.preventDefault();e.stopPropagation();
      startX=e.clientX;startY=e.clientY;
      var cs=window.getComputedStyle(img);
      origX=parseInt(img.style.marginLeft)||0;
      origY=parseInt(img.style.marginTop)||0;
      el.closest('.ae-wrap').classList.add('ae-active');
      function onMove(ev){
        var dx=ev.clientX-startX,dy=ev.clientY-startY;
        img.style.marginLeft=(origX+dx)+'px';
        img.style.marginTop=(origY+dy)+'px';
      }
      function onUp(ev){
        document.removeEventListener('mousemove',onMove);
        document.removeEventListener('mouseup',onUp);
        el.closest('.ae-wrap').classList.remove('ae-active');
        var dx=ev.clientX-startX,dy=ev.clientY-startY;
        sendUpdate(fn,{mx:(origX+dx),my:(origY+dy)});
      }
      document.addEventListener('mousemove',onMove);
      document.addEventListener('mouseup',onUp);
    });
  }

  /* ---- Make element resizable ---- */
  function makeResizable(handleEl,wrap,img,fn,corner){
    handleEl.addEventListener('mousedown',function(e){
      e.preventDefault();e.stopPropagation();
      var startX=e.clientX,startY=e.clientY;
      var origW=img.offsetWidth,origH=img.offsetHeight;
      var ratio=origW/origH;
      wrap.classList.add('ae-active');
      function onMove(ev){
        var dx=ev.clientX-startX,dy=ev.clientY-startY;
        var nw=origW,nh=origH;
        if(corner==='br'){nw=origW+dx;nh=origH+dy;}
        else if(corner==='bl'){nw=origW-dx;nh=origH+dy;}
        else if(corner==='tr'){nw=origW+dx;nh=origH-dy;}
        else if(corner==='tl'){nw=origW-dx;nh=origH-dy;}
        if(nw<40)nw=40;if(nh<40)nh=40;
        img.style.width=nw+'px';
        img.style.height=nh+'px';
        img.style.maxWidth='none';
        img.style.maxHeight='none';
      }
      function onUp(ev){
        document.removeEventListener('mousemove',onMove);
        document.removeEventListener('mouseup',onUp);
        wrap.classList.remove('ae-active');
        sendUpdate(fn,{w:img.style.width,h:img.style.height});
      }
      document.addEventListener('mousemove',onMove);
      document.addEventListener('mouseup',onUp);
    });
  }

  /* ---- Context menu ---- */
  function showContextMenu(x,y,items){
    closeContextMenu();
    var menu=document.createElement('div');
    menu.className='ae-ctx';
    menu.id='ae-ctx-menu';
    menu.style.left=x+'px';menu.style.top=y+'px';
    items.forEach(function(item){
      if(item==='---'){
        var sep=document.createElement('div');sep.className='ae-ctx-sep';menu.appendChild(sep);return;
      }
      var el=document.createElement('div');el.className='ae-ctx-item';
      el.textContent=item.label;
      el.addEventListener('click',function(ev){ev.stopPropagation();closeContextMenu();item.action();});
      menu.appendChild(el);
    });
    document.body.appendChild(menu);
    // Adjust if off-screen
    var rect=menu.getBoundingClientRect();
    if(rect.right>window.innerWidth)menu.style.left=(x-rect.width)+'px';
    if(rect.bottom>window.innerHeight)menu.style.top=(y-rect.height)+'px';
    setTimeout(function(){document.addEventListener('click',closeContextMenu,{once:true});},10);
  }
  function closeContextMenu(){
    var m=document.getElementById('ae-ctx-menu');if(m)m.remove();
  }

  /* ---- Setup image editor for one image ---- */
  function setupImage(img,fn,entry){
    var url=typeof entry==='object'?(entry&&entry.url):entry;
    var p=img.parentElement;if(!p)return;

    // Create wrapper
    var wrap=document.createElement('div');wrap.className='ae-wrap';
    wrap.style.display=window.getComputedStyle(img).display==='inline'?'inline-block':'block';
    p.insertBefore(wrap,img);
    wrap.appendChild(img);

    // Apply saved styles
    if(typeof entry==='object'){
      if(entry.fit)img.style.objectFit=entry.fit;
      if(entry.pos)img.style.objectPosition=entry.pos;
      if(entry.w)img.style.width=entry.w;
      if(entry.h)img.style.height=entry.h;
      if(entry.mx)img.style.marginLeft=entry.mx+'px';
      if(entry.my)img.style.marginTop=entry.my+'px';
      img.style.maxWidth='none';
      img.style.maxHeight='none';
    }

    // Resize handles
    var handles=document.createElement('div');handles.className='ae-handles';
    ['tl','tr','bl','br'].forEach(function(c){
      var h=document.createElement('div');h.className='ae-h ae-h-'+c;
      makeResizable(h,wrap,img,fn,c);
      handles.appendChild(h);
    });
    wrap.appendChild(handles);

    // Move overlay (click to select, drag to move)
    var moveEl=document.createElement('div');moveEl.className='ae-move';
    moveEl.addEventListener('click',function(e){
      e.stopPropagation();
      document.querySelectorAll('.ae-wrap.ae-selected').forEach(function(w){w.classList.remove('ae-selected');});
      wrap.classList.add('ae-selected');
    });
    makeDraggable(moveEl,img,fn,entry);
    wrap.appendChild(moveEl);

    // Toolbar
    var tb=document.createElement('div');tb.className='ae-toolbar';
    
    // Fit toggle button
    var fitBtn=document.createElement('button');fitBtn.className='ae-btn';
    var currentFit=(typeof entry==='object'&&entry.fit)||'cover';
    fitBtn.textContent=currentFit;
    fitBtn.title='Zuschnitt wechseln';
    fitBtn.addEventListener('click',function(ev){
      ev.stopPropagation();
      var fits=['cover','contain','fill','none'];
      var idx=fits.indexOf(img.style.objectFit||'cover');
      var next=fits[(idx+1)%fits.length];
      img.style.objectFit=next;
      fitBtn.textContent=next;
      sendUpdate(fn,{fit:next});
    });
    tb.appendChild(fitBtn);

    // Upload new image button
    var upBtn=document.createElement('button');upBtn.className='ae-btn ae-btn-add';
    upBtn.textContent=url?'Ersetzen':'Upload';
    upBtn.addEventListener('click',function(ev){ev.stopPropagation();sendUpload(fn);});
    tb.appendChild(upBtn);

    // More options button (context menu)
    var moreBtn=document.createElement('button');moreBtn.className='ae-btn';
    moreBtn.textContent='⋯';
    moreBtn.title='Mehr Optionen';
    moreBtn.addEventListener('click',function(ev){
      ev.stopPropagation();
      var rect=moreBtn.getBoundingClientRect();
      var items=[
        {label:'Bild löschen',action:function(){sendDelete(fn);}},
        '---',
        {label:'Container löschen',action:function(){
          if(confirm('Container komplett entfernen? Das Bild wird von der Seite gelöscht.')){
            sendDeleteContainer(fn);
            wrap.remove();
          }
        }},
        '---',
        {label:'Zurücksetzen',action:function(){
          img.style.width='';img.style.height='';img.style.marginLeft='';img.style.marginTop='';
          img.style.objectFit='';img.style.objectPosition='';img.style.maxWidth='';img.style.maxHeight='';
          sendUpdate(fn,{fit:'cover',pos:'center',w:'',h:'',mx:0,my:0});
        }}
      ];
      showContextMenu(rect.left,rect.bottom+4,items);
    });
    tb.appendChild(moreBtn);

    wrap.appendChild(tb);
  }

  /* ---- "Add new image" floating button ---- */
  function setupAddButton(){
    var btn=document.createElement('button');
    btn.className='ae-add-float';
    btn.textContent='+';
    btn.title='Neues Bild hinzufügen';
    var adding=false;
    btn.addEventListener('click',function(){
      if(adding){adding=false;btn.style.background='#3b82f6';btn.textContent='+';document.body.style.cursor='';return;}
      adding=true;
      btn.style.background='#f59e0b';btn.textContent='✖';
      document.body.style.cursor='crosshair';
    });
    document.body.appendChild(btn);

    document.addEventListener('click',function(e){
      if(!adding)return;
      if(e.target===btn||btn.contains(e.target))return;
      e.preventDefault();e.stopPropagation();
      adding=false;btn.style.background='#3b82f6';btn.textContent='+';document.body.style.cursor='';

      // Create a new image container at click position
      var id='_new_'+Date.now();
      var rect=document.body.getBoundingClientRect();
      var x=e.pageX,y=e.pageY;
      
      // Find the nearest section/container
      var target=document.elementFromPoint(e.clientX,e.clientY);
      var section=target;
      while(section&&section!==document.body){
        if(section.tagName==='SECTION'||section.classList.contains('container')||section.classList.contains('section'))break;
        section=section.parentElement;
      }
      if(!section||section===document.body)section=target.parentElement||document.body;

      // Create placeholder
      var div=document.createElement('div');
      div.className='ae-new-img ae-wrap';
      div.style.width='200px';div.style.height='150px';
      div.style.position='relative';
      div.style.margin='10px auto';
      
      var placeholder=document.createElement('div');
      placeholder.style.cssText='width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:13px;cursor:pointer;';
      placeholder.textContent='Klicken zum Upload';
      placeholder.addEventListener('click',function(){sendUpload(id);});
      div.appendChild(placeholder);

      // Insert after clicked element
      if(target.nextSibling){
        target.parentElement.insertBefore(div,target.nextSibling);
      }else{
        target.parentElement.appendChild(div);
      }

      sendNewContainer({filename:id,page:currentPage,x:x,y:y});
    },true);
  }

  /* ---- Init: listen for admin-init ---- */
  window.addEventListener('message',function(e){
    var d=e.data;if(!d)return;
    
    if(d.type==='admin-init'){
      map=d.map||{};
      currentPage=d.page||'';

      // Hide decorative elements
      var s=document.createElement('style');
      s.textContent='.preloader,.scroll-progress,.grain-overlay,.cursor-glow,.ticker-banner{display:none!important;}body{overflow:auto!important;}';
      document.head.appendChild(s);

      // Process all images
      document.querySelectorAll('img[src^="images/"]').forEach(function(img){
        var fn=img.getAttribute('src').replace('images/','');
        var entry=map[fn];
        var url=typeof entry==='object'?(entry&&entry.url):entry;

        img.removeAttribute('onerror');img.onerror=null;
        if(url){img.src=url;img.style.display='';}
        
        var nx=img.nextElementSibling;
        if(nx&&nx.classList&&nx.classList.contains('initials'))nx.style.display='none';

        setupImage(img,fn,entry||{});
      });

      // Disable all links
      document.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click',function(ev){ev.preventDefault();});
        a.style.cursor='default';
      });

      // Click on background deselects all
      document.addEventListener('click',function(e){
        if(!e.target.closest('.ae-wrap')&&!e.target.closest('.ae-ctx')&&!e.target.closest('.ae-add-float')){
          document.querySelectorAll('.ae-wrap.ae-selected').forEach(function(w){w.classList.remove('ae-selected');});
        }
      });

      // Add floating "+" button
      setupAddButton();
    }

    // Handle uploaded image for new containers
    if(d.type==='admin-uploaded'&&d.filename&&d.url){
      var placeholder=document.querySelector('.ae-new-img');
      if(placeholder){
        placeholder.innerHTML='';
        var img=document.createElement('img');
        img.src=d.url;
        placeholder.appendChild(img);
        setupImage(img,d.filename,{url:d.url,fit:'cover',pos:'center'});
      }
    }
  });
})();
