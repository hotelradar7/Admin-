// ================================================================
// admin-hotel-form.js — HotelRadar Admin Panel
// Hotel Add/Edit Form — 3 steps:
// Step 1: Basic Info (name, city, phone, price...)
// Step 2: Amenities & Badges
// Step 3: Photos & Appearance (image upload)
// Depends on: config.js, admin-core.js
// ================================================================

function renderHotelForm(){
  const f=S.hf;
  const step=S.hfStep||1;

  function livePreview(){
    const coverImg=(f.images||[]).find(i=>i.primary)?.url||f.imageUrl||'';
    return el('div',{style:{margin:'0 0 14px',background:f.gradient||'linear-gradient(135deg,#1a1a2e,#0f3460)',borderRadius:'16px',overflow:'hidden',position:'relative'}},
      coverImg
        ? el('div',{style:{height:'100px',position:'relative',overflow:'hidden'}},
            el('img',{src:coverImg,style:{width:'100%',height:'100%',objectFit:'cover',display:'block'},loading:'lazy'}),
            el('div',{style:{position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.5))'}})
          )
        : el('div',{style:{height:'100px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'44px',background:f.gradient||'linear-gradient(135deg,#1a1a2e,#0f3460)'}},f.emoji||'🏨'),
      el('div',{style:{padding:'10px 14px',background:'rgba(0,0,0,.35)'}},
        el('h3',{style:{color:'#fff',fontSize:'14px',fontWeight:'700',fontFamily:'Fraunces,serif'}},(f.name||'Your Hotel Name')),
        el('p',{style:{color:'rgba(255,255,255,.7)',fontSize:'11px',marginTop:'2px'}},(f.area?f.area+', ':'')+(f.city||'City')+', '+(f.state||'State')),
        el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'6px'}},
          el('span',{style:{color:'#fff',fontWeight:'700',fontSize:'13px'}},'Rs.'+(f.price?(Number(f.price)).toLocaleString('en-IN'):'—')+'/night'),
          el('span',{style:{background:'rgba(255,255,255,.2)',color:'#fff',fontSize:'9px',fontWeight:'700',padding:'2px 7px',borderRadius:'999px'}},(f.type||'hotel').toUpperCase())
        )
      )
    );
  }

  function stepBar(){
    const steps=['Basic Info','Location & Price','Look & Feel','Amenities'];
    return el('div',{style:{display:'flex',gap:'4px',marginBottom:'14px'}},
      ...steps.map((s,i)=>{
        const active=i+1===step,done=i+1<step;
        return el('div',{style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'},onClick:()=>set({hfStep:i+1})},
          el('div',{style:{width:'100%',height:'3px',borderRadius:'2px',background:done?'var(--good)':active?'var(--ac)':'var(--line)'}}),
          el('span',{style:{fontSize:'9px',fontWeight:'700',color:done?'var(--good)':active?'var(--ac)':'var(--ink-f)',textAlign:'center',cursor:'pointer'}},s)
        );
      })
    );
  }

  function step1(){
    return el('div',{style:{display:'flex',flexDirection:'column',gap:'12px'}},
      el('div',{},lbl('Hotel Name *'),
        el('input',{class:'inp',value:f.name||'',placeholder:'e.g. Ganga Palace Hotel',onInput:e=>{S.hf.name=e.target.value;}})
      ),
      el('div',{},lbl('About Your Hotel'),
        el('textarea',{class:'inp',rows:'3',placeholder:'Tell guests about your hotel, location, specialities...',onInput:e=>{S.hf.desc=e.target.value;}},f.desc||'')
      ),
      el('div',{},lbl('Phone Number *'),
        el('input',{class:'inp',value:f.phone||'',placeholder:'+91 98765 43210',onInput:e=>{S.hf.phone=e.target.value;}})
      ),
      el('div',{class:'g2'},
        el('div',{},lbl('Check-in'),el('input',{class:'inp',value:f.checkIn||'12:00 PM',onInput:e=>{S.hf.checkIn=e.target.value;}})),
        el('div',{},lbl('Check-out'),el('input',{class:'inp',value:f.checkOut||'11:00 AM',onInput:e=>{S.hf.checkOut=e.target.value;}}))
      ),
      el('div',{},lbl('Hotel Type'),
        el('div',{style:{display:'flex',flexWrap:'wrap',gap:'7px'}},
          ...['Hotel','Resort','Ashram','Guesthouse','Dharamshala','Homestay'].map(t=>{
            const on=(f.type||'hotel')===t.toLowerCase();
            return el('button',{
              style:{padding:'6px 13px',borderRadius:'999px',border:'2px solid '+(on?'var(--ac)':'var(--line)'),background:on?'var(--acd)':'var(--card)',color:on?'var(--aci)':'var(--ink-s)',fontWeight:'700',fontSize:'12px',cursor:'pointer'},
              onClick:()=>sh({type:t.toLowerCase()})
            },t);
          })
        )
      )
    );
  }

  function step2(){
    return el('div',{style:{display:'flex',flexDirection:'column',gap:'12px'}},
      el('div',{class:'g2'},
        el('div',{},lbl('City *'),el('input',{class:'inp',value:f.city||'',placeholder:'Haridwar',onInput:e=>{S.hf.city=e.target.value;}})),
        el('div',{},lbl('State *'),el('input',{class:'inp',value:f.state||'',placeholder:'Uttarakhand',onInput:e=>{S.hf.state=e.target.value;}}))
      ),
      el('div',{class:'g2'},
        el('div',{},lbl('Area / Locality'),el('input',{class:'inp',value:f.area||'',placeholder:'Har Ki Pauri Road',onInput:e=>{S.hf.area=e.target.value;}})),
        el('div',{},lbl('PIN Code'),el('input',{class:'inp',value:f.pin||'',placeholder:'249401',onInput:e=>{S.hf.pin=e.target.value;}}))
      ),
      el('div',{},
        lbl('Base Price per Night (Rs.) *'),
        el('div',{style:{position:'relative'}},
          el('span',{style:{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',fontWeight:'700',color:'var(--ink-s)',fontSize:'14px'}},'Rs.'),
          el('input',{class:'inp',type:'number',style:{paddingLeft:'36px',fontSize:'16px',fontWeight:'700'},value:f.price||'',placeholder:'2800',onInput:e=>{S.hf.price=e.target.value;}})
        ),
        el('p',{style:{fontSize:'11px',color:'var(--ink-f)',marginTop:'5px'}},'Room categories (Category 1, 2, 3) auto-calculate from this base price.')
      ),
      f.price?el('div',{style:{background:'var(--pd)',borderRadius:'12px',padding:'12px'}},
        el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'8px'}},'Room Category Preview'),
        el('div',{style:{display:'flex',gap:'8px',overflowX:'auto'}},
          ...getDemoRooms(Number(f.price)||2500).map(r=>
            el('div',{style:{flexShrink:0,textAlign:'center',padding:'8px 12px',background:'var(--card)',borderRadius:'10px',border:'1px solid var(--line)',minWidth:'85px'}},
              el('p',{style:{fontSize:'18px',marginBottom:'2px'}},r.emoji),
              el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink)'}},r.label),
              el('p',{style:{fontSize:'10px',color:'var(--ac)',fontWeight:'700'}},'Rs.'+Math.round(Number(f.price)*r.mult).toLocaleString('en-IN'))
            )
          )
        )
      ):null
    );
  }

  function step3(){
    const EMOJIS=['🏨','🏩','🏰','🏯','🏡','🌴','⛺','🛖','🏔️','🌊','🕌','🛕'];
    const GRADS=[
      {l:'Night Blue',v:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)'},
      {l:'Sunset Orange',v:'linear-gradient(135deg,#E8631C,#F2A65A)'},
      {l:'Forest Green',v:'linear-gradient(135deg,#134E5E,#71B280)'},
      {l:'Royal Purple',v:'linear-gradient(135deg,#4A00E0,#8E2DE2)'},
      {l:'Rose Gold',v:'linear-gradient(135deg,#b06ab3,#4568dc)'},
      {l:'Ocean Blue',v:'linear-gradient(135deg,#2193b0,#6dd5ed)'},
      {l:'Golden Hour',v:'linear-gradient(135deg,#F7971E,#FFD200)'},
      {l:'Dark Forest',v:'linear-gradient(135deg,#0f2027,#203a43,#2c5364)'},
    ];
    return el('div',{style:{display:'flex',flexDirection:'column',gap:'14px'}},
      el('div',{},
        lbl('Hotel Emoji / Icon'),
        el('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'6px'}},
          ...EMOJIS.map(e=>
            el('button',{
              style:{width:'44px',height:'44px',fontSize:'22px',borderRadius:'10px',border:'2px solid '+(f.emoji===e?'var(--ac)':'var(--line)'),background:f.emoji===e?'var(--acd)':'var(--pd)',cursor:'pointer'},
              onClick:()=>sh({emoji:e})
            },e)
          )
        )
      ),
      // ── GALLERY IMAGE UPLOAD ──
      el('div',{},
        lbl('Hotel Photos (up to 20 images)'),

        // Upload zone — label wrapping file input (most reliable cross-browser/mobile)
        (()=>{
          const existing = (S.hf.images||[]).length;
          const full = existing >= 20;
          const uid = 'hr-img-' + Date.now();

          // Native file input — inside label for maximum compatibility
          const inp = el('input',{
            type:'file', id: uid,
            accept:'image/jpeg,image/png,image/webp,image/gif',
            multiple: true,
            style:{position:'absolute',width:'1px',height:'1px',opacity:'0',overflow:'hidden',zIndex:'-1'}
          });
          inp.addEventListener('change', function(e){
            if(e.target.files && e.target.files.length > 0){
              handleImageFiles(e.target.files);
              setTimeout(function(){ try{ inp.value=''; }catch(ex){} }, 300);
            }
          });

          // Label acts as the click target — clicking label opens file picker natively
          const lbl = el('label',{
            for: uid,
            style:{
              display:'block',
              border:'2px dashed '+(full?'var(--line)':'var(--ac)'),
              borderRadius:'16px',
              background: full?'var(--pd)':'var(--acd)',
              padding:'22px 16px',
              textAlign:'center',
              cursor: full?'not-allowed':'pointer',
              userSelect:'none',
              transition:'background .15s, border-color .15s',
            }
          },
            inp,
            el('div',{style:{fontSize:'30px',marginBottom:'8px',pointerEvents:'none'}},'📸'),
            el('p',{style:{fontSize:'13px',fontWeight:'700',color:full?'var(--ink-f)':'var(--aci)',marginBottom:'4px',pointerEvents:'none'}},
              full ? '20/20 limit reached'
                : (existing > 0 ? 'Tap to add more photos ('+existing+'/20)' : 'Tap to open gallery')
            ),
            el('p',{style:{fontSize:'11px',color:'var(--ink-f)',pointerEvents:'none'}}, 'JPG · PNG · WEBP · Max 5MB each')
          );

          if(!full){
            lbl.addEventListener('dragover', function(e){ e.preventDefault(); lbl.style.background='color-mix(in srgb,var(--acd) 60%,var(--ac) 40%)'; });
            lbl.addEventListener('dragleave', function(){ lbl.style.background='var(--acd)'; });
            lbl.addEventListener('drop', function(e){
              e.preventDefault(); lbl.style.background='var(--acd)';
              if(e.dataTransfer.files&&e.dataTransfer.files.length) handleImageFiles(e.dataTransfer.files);
            });
          }
          return lbl;
        })(),

        // Upload progress bar
        S.imgUploading ? el('div',{style:{marginTop:'8px'}},
          el('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:'4px'}},
            el('span',{style:{fontSize:'11px',fontWeight:'700',color:'var(--ink-s)'}},'Uploading...'),
            el('span',{style:{fontSize:'11px',color:'var(--ac)',fontWeight:'700'}},S.imgUploadProg+'%')
          ),
          el('div',{class:'img-prog'},
            el('div',{class:'img-prog-bar',id:'hr-img-prog-bar',style:{width:(S.imgUploadProg||0)+'%'}})
          )
        ) : null,

        // Error
        S.imgUploadErr ? el('p',{style:{fontSize:'11px',color:'#DC2626',marginTop:'4px',fontWeight:'600'}}, '⚠ '+S.imgUploadErr) : null,

        // Image grid
        (S.hf.images||[]).length > 0 ? el('div',{},
          el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',margin:'10px 0 6px',textTransform:'uppercase',letterSpacing:'.06em'}},
            (S.hf.images||[]).length+' photo'+ ((S.hf.images||[]).length>1?'s':'')+' added · Tap ★ to set cover'
          ),
          el('div',{class:'img-grid'},
            ...(S.hf.images||[]).map((img,idx) =>
              el('div',{class:'img-thumb'},
                el('img',{src:img.url, alt:'Hotel photo '+( idx+1), loading:'lazy'}),
                // Delete button
                el('button',{class:'img-del', title:'Remove', onClick:()=>removeImage(idx)}, ic('x',10)),
                // Primary badge or "set as cover" button
                img.primary
                  ? el('div',{class:'img-primary-badge'},'Cover')
                  : el('button',{class:'img-set-primary', title:'Set as cover photo', onClick:()=>setPrimaryImage(idx)},'★ Cover')
              )
            )
          )
        ) : null,

        // Fallback URL input (for pasting external links)
        el('div',{style:{marginTop:'10px',display:'flex',alignItems:'center',gap:'8px'}},
          el('span',{style:{fontSize:'11px',color:'var(--ink-f)',fontWeight:'600',whiteSpace:'nowrap'}},'Or paste URL:'),
          el('input',{class:'inp',style:{flex:1,fontSize:'12px'},
            value: (S.hf.images||[]).length > 0 ? '' : (f.imageUrl||''),
            placeholder:'https://example.com/photo.jpg',
            onInput: e => { S.hf.imageUrl = e.target.value; },
            onBlur: e => {
              const url = e.target.value.trim();
              if(url && url.startsWith('http')){
                const imgs = [...(S.hf.images||[])];
                imgs.push({url, primary: imgs.length===0});
                if(imgs.length===1) S.hf.imageUrl = url;
                S.hf.images = imgs;
                e.target.value = '';
                render();
              }
            }
          })
        )
      ),
      el('div',{},
        lbl('Card Background Theme'),
        el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
          ...GRADS.map(g=>
            el('button',{
              style:{height:'48px',borderRadius:'10px',background:g.v,border:'3px solid '+(f.gradient===g.v?'#fff':'transparent'),cursor:'pointer',fontSize:'11px',fontWeight:'700',color:'#fff',textShadow:'0 1px 3px rgba(0,0,0,.5)',transition:'all .15s'},
              onClick:()=>sh({gradient:g.v})
            },g.l)
          )
        )
      )
    );
  }

  function step4(){
    const GROUPS={
      'Basic':['AC','Hot Water','WiFi','TV','Parking','24/7 Reception'],
      'Food':['Restaurant','Breakfast Included','Room Service','Kitchen Access','Bar'],
      'Views':['Ganga View','Mountain View','Garden View','Sea View','City View'],
      'Comfort':['Spa','Gym','Pool','Balcony','Mini Bar','Laundry'],
      'Special':['Couple Friendly','Family Friendly','Pet Friendly','Airport Shuttle','Wheelchair Accessible'],
    };
    const EMOJIS2={Basic:'⚡',Food:'🍽️',Views:'🌄',Comfort:'💆',Special:'💝'};
    return el('div',{style:{display:'flex',flexDirection:'column',gap:'14px'}},
      ...Object.entries(GROUPS).map(([grp,items])=>
        el('div',{},
          el('p',{style:{fontSize:'12px',fontWeight:'700',color:'var(--ink)',marginBottom:'7px'}},EMOJIS2[grp]+' '+grp),
          el('div',{style:{display:'flex',flexWrap:'wrap',gap:'6px'}},
            ...items.map(a=>{
              const on=(f.amenities||[]).includes(a);
              return el('button',{
                style:{padding:'6px 12px',borderRadius:'999px',border:'1px solid '+(on?'var(--ac)':'var(--line)'),background:on?'var(--ac)':'var(--card)',color:on?'#fff':'var(--ink-s)',fontSize:'12px',fontWeight:'600',cursor:'pointer',transition:'all .12s'},
                onClick:()=>sh({amenities:on?(f.amenities||[]).filter(x=>x!==a):[...(f.amenities||[]),a]})
              },a);
            })
          )
        )
      ),
      el('div',{},
        el('p',{style:{fontSize:'11px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'6px'}},'Add Custom Amenity'),
        el('div',{style:{display:'flex',gap:'8px'}},
          el('input',{class:'inp',style:{flex:1},placeholder:'e.g. Heater, Bonfire...',value:S.amenityInput,
            onInput:e=>setInput({amenityInput:e.target.value}),
            onKeydown:e=>{if(e.key==='Enter'&&S.amenityInput.trim()){sh({amenities:[...(f.amenities||[]),S.amenityInput.trim()]});set({amenityInput:''});}}
          }),
          el('button',{class:'btn ba',style:{flexShrink:0},
            onClick:()=>{if(S.amenityInput.trim()){sh({amenities:[...(f.amenities||[]),S.amenityInput.trim()]});set({amenityInput:'',});}}
          },'Add')
        )
      ),
      (f.amenities||[]).length>0&&el('div',{},
        el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'6px'}},'SELECTED ('+f.amenities.length+')'),
        el('div',{style:{display:'flex',flexWrap:'wrap',gap:'5px'}},
          ...(f.amenities||[]).map(a=>
            el('button',{
              style:{padding:'4px 10px',borderRadius:'999px',background:'var(--acd)',border:'1px solid var(--ac)',color:'var(--aci)',fontSize:'11px',fontWeight:'700',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px'},
              onClick:()=>sh({amenities:f.amenities.filter(x=>x!==a)})
            },a,' x')
          )
        )
      )
    );
  }

  // Full screen page
  const page=el('div',{style:{position:'fixed',inset:0,background:'var(--paper)',zIndex:50,overflowY:'auto'}});

  // Header
  page.appendChild(el('div',{style:{position:'sticky',top:0,background:'var(--card)',borderBottom:'1px solid var(--line)',padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px',zIndex:10,boxShadow:'var(--s1)'}},
    el('button',{style:{width:'34px',height:'34px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:'var(--pd)',color:'var(--ink-s)',flexShrink:0},
      onClick:()=>set({showHotelForm:false,editHotel:null,hfStep:1,hfErr:''})},
      ic('x',16)
    ),
    el('div',{style:{flex:1}},
      el('h2',{style:{fontSize:'15px',color:'var(--ink)',fontFamily:'Fraunces,serif'}},(S.editHotel?'Edit':'Setup Your')+' Hotel'),
      el('p',{style:{fontSize:'11px',color:'var(--ink-f)',marginTop:'1px'}},'Step '+step+' of 4')
    ),
    step===4?el('button',{class:'btn ba',style:{padding:'7px 14px',fontSize:'12px'},disabled:S.hfSaving,onClick:saveHotel},
      S.hfSaving?sp():ic('save',13),'Save'
    ):null
  ));

  // Body
  const body=el('div',{style:{padding:'16px',maxWidth:'520px',margin:'0 auto'}});
  body.appendChild(livePreview());
  if(S.hfErr){
    body.appendChild(el('div',{style:{display:'flex',alignItems:'center',gap:'7px',padding:'9px 12px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'8px',fontSize:'12px',color:'#DC2626',marginBottom:'12px'}},ic('warn',12),S.hfErr));
  }
  body.appendChild(stepBar());
  const sc=el('div',{style:{background:'var(--card)',border:'1px solid var(--line)',borderRadius:'16px',padding:'16px',marginBottom:'14px'}});
  if(step===1)sc.appendChild(step1());
  else if(step===2)sc.appendChild(step2());
  else if(step===3)sc.appendChild(step3());
  else sc.appendChild(step4());
  body.appendChild(sc);

  // Nav buttons
  const nav=el('div',{style:{display:'flex',gap:'10px',marginBottom:'80px'}});
  if(step>1){
    nav.appendChild(el('button',{class:'btn bo',style:{flex:1,justifyContent:'center'},onClick:()=>set({hfStep:step-1,hfErr:''})},'Back'));
  }
  if(step<4){
    nav.appendChild(el('button',{class:'btn ba',style:{flex:2,justifyContent:'center'},onClick:()=>{
      if(step===1&&!S.hf.name?.trim()){set({hfErr:'Enter hotel name.'});return;}
      if(step===1&&!S.hf.phone?.trim()){set({hfErr:'Enter phone number.'});return;}
      if(step===2&&!S.hf.city?.trim()){set({hfErr:'Enter city.'});return;}
      if(step===2&&!S.hf.state?.trim()){set({hfErr:'Enter state.'});return;}
      if(step===2&&(!S.hf.price||Number(S.hf.price)<=0)){set({hfErr:'Enter valid price.'});return;}
      set({hfStep:step+1,hfErr:''});
    }},'Next →'));
  } else {
    nav.appendChild(el('button',{class:'btn ba',style:{flex:2,justifyContent:'center',padding:'13px'},disabled:S.hfSaving,onClick:saveHotel},
      S.hfSaving?sp():null,S.hfSaving?'Saving...':'Submit for Approval'));
  }
  body.appendChild(nav);

  if(step===4){
    body.appendChild(el('div',{style:{padding:'12px 14px',background:'var(--gd)',borderRadius:'10px',marginBottom:'24px'}},
      el('p',{style:{fontSize:'11px',color:'var(--good)',lineHeight:'1.7',fontWeight:'600'}},'After submission, HotelRadar admin will review and approve your listing. Approved hotels appear in search results automatically.')
    ));
  }

  page.appendChild(body);
  return page;
}


// SHARE MODAL
// ══════════════════════════════════════════
