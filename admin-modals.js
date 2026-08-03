// ============================================================
// admin-modals.js — HotelRadar Admin Panel
// Modals: Share, Payment, Confirm, Toast
// Room Editor Modal
// Welcome Animation
// Main render() function — entry point
// Depends on: ALL other JS files
// ============================================================

function renderShareModal(){
  return el('div',{class:'ov',style:{alignItems:'center'},onClick:e=>e.target.classList.contains('ov')&&set({showShare:false})},
    el('div',{style:{width:'100%',maxWidth:'400px',background:'var(--card)',borderRadius:'20px',padding:'22px',boxShadow:'var(--s3)',border:'1px solid var(--line)'},class:'fi'},
      el('h3',{style:{fontSize:'16px',color:'var(--ink)',marginBottom:'5px'}},'Share Hotel Admin Access'),
      el('p',{style:{fontSize:'12px',color:'var(--ink-s)',marginBottom:'14px',lineHeight:'1.6'}},'Enter hotel owner Gmail → A unique link is generated → Share link → They login and see their panel.'),
      S.shareErr?el('div',{style:{display:'flex',alignItems:'center',gap:'6px',padding:'8px 12px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'8px',marginBottom:'10px',fontSize:'12px',color:'#DC2626'}},ic('warn',12),S.shareErr):null,
      lbl('Hotel Owner Gmail *'),
      el('input',{class:'inp',type:'email',placeholder:'owner@gmail.com',value:S.shareEmail,style:{marginBottom:'12px'},onInput:e=>setInput({shareEmail:e.target.value}),onKeydown:e=>e.key==='Enter'&&shareAdmin()}),
      S.genLink?el('div',{style:{marginBottom:'12px'}},
        el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--good)',marginBottom:'5px'}},'✅ Link generated! Share with hotel owner:'),
        el('div',{class:'lbx'},el('span',{style:{flex:1,wordBreak:'break-all'}},S.genLink),
          el('button',{style:{flexShrink:0,display:'flex',alignItems:'center',gap:'3px',padding:'5px 9px',background:'var(--ac)',color:'#fff',fontWeight:'700',fontSize:'11px',borderRadius:'6px'},onClick:()=>{navigator.clipboard.writeText(S.genLink);toast('Copied!');}},ic('copy',11),'Copy')
        )
      ):null,
      el('div',{style:{display:'flex',gap:'8px'}},
        el('button',{class:'btn bo',style:{flex:1,justifyContent:'center'},onClick:()=>set({showShare:false})},'Close'),
        el('button',{class:'btn ba',style:{flex:1,justifyContent:'center'},disabled:S.shareSaving,onClick:shareAdmin},S.shareSaving?sp():ic('share',13),S.shareSaving?'Generating...':'Generate Link')
      )
    )
  );
}

// ══════════════════════════════════════════
// PAYMENT MODAL
// ══════════════════════════════════════════
function renderPaymentModal(){
  return el('div',{class:'ov',style:{alignItems:'center'},onClick:e=>e.target.classList.contains('ov')&&set({showPayment:false})},
    el('div',{style:{width:'100%',maxWidth:'360px',background:'var(--card)',borderRadius:'20px',padding:'22px',boxShadow:'var(--s3)',border:'1px solid var(--line)'},class:'fi'},
      el('h3',{style:{fontSize:'16px',color:'var(--ink)',marginBottom:'5px'}},'Upgrade Plan'),
      el('p',{style:{fontSize:'12px',color:'var(--ink-s)',marginBottom:'14px',lineHeight:'1.6'}},'Contact HotelRadar to activate. We will confirm within minutes.'),
      el('div',{style:{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'14px'}},
        ...[{v:'monthly',p:'₹999/mo',l:'Monthly Plan',d:'Unlimited bookings',c:'var(--good)',bg:'var(--gd)'},
            {v:'perbooking',p:'₹49/booking',l:'Per Booking',d:'Pay only when you earn',c:'var(--blue)',bg:'var(--bd)'}].map(o=>
          el('div',{style:{padding:'12px',background:o.bg,border:'2px solid '+(S.payOpt===o.v?o.c:'var(--line)'),borderRadius:'10px',cursor:'pointer'},onClick:()=>set({payOpt:o.v})},
            el('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
              el('div',{},el('p',{style:{fontWeight:'700',fontSize:'13px',color:'var(--ink)'}},o.l),el('p',{style:{fontSize:'11px',color:'var(--ink-s)'}},o.d)),
              el('p',{style:{fontSize:'17px',fontWeight:'700',color:o.c,fontFamily:'Fraunces,serif'}},o.p)
            )
          )
        )
      ),
      el('a',{href:'https://wa.me/919876543210?text=Hi+HotelRadar%2C+I+want+to+activate+'+encodeURIComponent(S.payOpt==='monthly'?'Monthly Plan ₹999':'Per Booking ₹49'),target:'_blank',style:{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%',padding:'11px',background:'#25D366',color:'#fff',fontWeight:'700',fontSize:'13px',borderRadius:'8px',textDecoration:'none',marginBottom:'7px'}},'💬 Contact on WhatsApp'),
      el('button',{class:'btn bo btn-w',onClick:()=>set({showPayment:false})},'Close')
    )
  );
}

// ══════════════════════════════════════════
// CONFIRM DELETE
// ══════════════════════════════════════════
function renderConfirm(){
  const titles={hotel:'Delete Hotel?',review:'Remove Review?',booking:'Remove Booking?'};
  return el('div',{class:'ov',style:{alignItems:'center'},onClick:e=>e.target.classList.contains('ov')&&set({delId:null,delType:''})},
    el('div',{style:{width:'100%',maxWidth:'310px',background:'var(--card)',borderRadius:'18px',padding:'22px',textAlign:'center',boxShadow:'var(--s3),border:1px solid var(--line)'},class:'fi'},
      el('div',{style:{width:'44px',height:'44px',borderRadius:'50%',background:'#FEF2F2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',color:'#EF4444'}},ic('trash',20)),
      el('h3',{style:{fontSize:'15px',color:'var(--ink)',marginBottom:'5px'}},titles[S.delType]||'Delete?'),
      el('p',{style:{fontSize:'12px',color:'var(--ink-s)',marginBottom:'18px'}},'This cannot be undone.'),
      el('div',{style:{display:'flex',gap:'8px'}},
        el('button',{class:'btn bo',style:{flex:1,justifyContent:'center'},onClick:()=>set({delId:null,delType:''})},'Cancel'),
        el('button',{class:'btn br',style:{flex:1,justifyContent:'center'},onClick:async()=>{
          if(S.delType==='hotel')await delHotel(S.delId);
          else if(S.delType==='review')await delReview(S.delId);
          else if(S.delType==='booking')await delBooking(S.delId);
        }},ic('trash',13),'Delete')
      )
    )
  );
}

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
function renderToast(){
  if(!S.toast)return null;
  const d=document.createElement('div');
  d.style.cssText=`position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:${S.toast.t==='err'?'#EF4444':'#1F7A4D'};color:#fff;padding:9px 18px;border-radius:999px;font-size:12px;font-weight:700;z-index:100;box-shadow:0 4px 16px rgba(0,0,0,.2);white-space:nowrap`;
  d.textContent=S.toast.msg;
  return d;
}


// ══════════════════════════════════════════
// ROOM EDITOR MODAL
// ══════════════════════════════════════════
function renderRoomEditor(){
  const rooms = S.editingRooms || [];

  async function saveRooms(){
    const h = S.myHotel;
    if(!h||!db){ toast('Hotel not found.','err'); return; }
    const toSave = S.editingRooms;
    if(!toSave||toSave.length===0){ toast('Add at least one room category.','err'); return; }
    try{
      await db.ref('hotels/'+h.id).update({customRooms: toSave});
      set({showRoomEditor:false, roomEditorFocus:null});
      toast('Room categories saved!');
    } catch(e){
      toast('Save failed: '+e.message,'err');
    }
  }
  // Scroll to focused room after render
  if(typeof S.roomEditorFocus === 'number'){
    setTimeout(function(){
      const cards = document.querySelectorAll('[data-room-idx]');
      if(cards[S.roomEditorFocus]) cards[S.roomEditorFocus].scrollIntoView({behavior:'smooth',block:'center'});
    }, 100);
  }

  const modal = el('div',{style:{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:60,display:'flex',alignItems:'flex-end',justifyContent:'center'}},
    el('div',{style:{width:'100%',maxWidth:'520px',background:'var(--card)',borderRadius:'20px 20px 0 0',maxHeight:'88vh',display:'flex',flexDirection:'column'}},
      // Header
      el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid var(--line)',flexShrink:0}},
        el('div',{},
          el('h3',{style:{fontSize:'15px',fontFamily:'Fraunces,serif',color:'var(--ink)'}},'Edit Room Categories'),
          el('p',{style:{fontSize:'11px',color:'var(--ink-f)',marginTop:'2px'}},'Customize features for each room category')
        ),
        el('button',{style:{width:'30px',height:'30px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',background:'var(--pd)',color:'var(--ink-s)'},
          onClick:()=>set({showRoomEditor:false})},ic('x',13))
      ),
      // Body
      el('div',{style:{overflowY:'auto',flex:1,padding:'14px',display:'flex',flexDirection:'column',gap:'14px'}},
        ...rooms.map((room,ri)=>{
          const EMOJIS=['🛏️','✨','🌟','👑','🏡','🌊','🔑','💎'];
          const FEATURES_LIST=['AC','WiFi','TV','Hot Water','Mini Fridge','Mini Bar','Balcony','Bathtub','City View','Mountain View','Room Service','24/7 Service','Butler','Jacuzzi','King Bed','Super King','Sofa Bed','Extra Bed'];

          return el('div',{'data-room-card':'1',style:{background:'var(--pd)',borderRadius:'12px',padding:'14px',border:'1px solid var(--line)',position:'relative'}},
            // Room header
            el('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}},
              el('span',{style:{fontSize:'22px'}},room.emoji||'🛏️'),
              el('div',{style:{flex:1}},
                el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)'}},room.label||('Category '+(ri+1))),
                el('p',{style:{fontSize:'10px',color:'var(--ink-f)'}},'Price multiplier: x'+room.mult)
              ),
              // Delete this room button
              S.editingRooms.length > 1 ? el('button',{
                style:{width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',
                       background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'8px',
                       color:'#DC2626',cursor:'pointer',flexShrink:0},
                title:'Remove this room category',
                onClick:()=>{
                  if(!confirm('Remove "'+(room.label||'this category')+'"?')) return;
                  S.editingRooms = S.editingRooms.filter((_,i)=>i!==ri);
                  render();
                }
              }, ic('trash',13)) : null
            ),

            // Room Label input
            el('div',{style:{marginBottom:'10px'}},
              el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'5px'}},'ROOM NAME'),
              el('input',{class:'inp',value:room.label||'',placeholder:'e.g. Deluxe Room',
                style:{width:'100%',fontSize:'13px'},
                onInput:e=>{S.editingRooms[ri].label=e.target.value;/* no re-render needed */}
              })
            ),

            // Price Multiplier
            el('div',{style:{marginBottom:'10px'}},
              el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'5px'}},'PRICE MULTIPLIER (base price × this)'),
              el('div',{style:{display:'flex',gap:'6px',flexWrap:'wrap'}},
                [0.5,0.75,1,1.25,1.5,2,2.5,3].map(m=>
                  el('button',{
                    style:{padding:'4px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:'700',
                           border:'2px solid '+(room.mult===m?'var(--ac)':'var(--line)'),
                           background:room.mult===m?'var(--acd)':'var(--card)',cursor:'pointer'},
                    onClick:()=>{S.editingRooms[ri].mult=m;render();}
                  },'×'+m)
                )
              )
            ),

            // Tag / badge text
            el('div',{style:{marginBottom:'10px'}},
              el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'5px'}},'BADGE LABEL'),
              el('input',{class:'inp',value:room.tag||'',placeholder:'e.g. Best Value',
                style:{width:'100%',fontSize:'13px'},
                onInput:e=>{S.editingRooms[ri].tag=e.target.value;}
              })
            ),

            // Emoji picker
            el('div',{style:{marginBottom:'10px'}},
              el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'5px'}},'EMOJI'),
              el('div',{style:{display:'flex',flexWrap:'wrap',gap:'5px'}},
                ...EMOJIS.map(e=>
                  el('button',{
                    style:{width:'34px',height:'34px',fontSize:'18px',borderRadius:'8px',border:'2px solid '+(room.emoji===e?'var(--ac)':'var(--line)'),background:room.emoji===e?'var(--acd)':'var(--card)',cursor:'pointer'},
                    onClick:()=>{S.editingRooms[ri].emoji=e;render();}
                  },e)
                )
              )
            ),

            // Bed type & size
            el('div',{class:'g2',style:{marginBottom:'10px'}},
              el('div',{},
                el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'4px'}},'BED TYPE'),
                el('input',{class:'inp',style:{fontSize:'12px'},value:room.bedType||'',placeholder:'e.g. King Bed',
                  onInput:e=>{S.editingRooms[ri].bedType=e.target.value;}})
              ),
              el('div',{},
                el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'4px'}},'SIZE'),
                el('input',{class:'inp',style:{fontSize:'12px'},value:room.size||'',placeholder:'e.g. 240 sq ft',
                  onInput:e=>{S.editingRooms[ri].size=e.target.value;}})
              )
            ),

            // Max guests
            el('div',{style:{marginBottom:'10px'}},
              el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'4px'}},'MAX GUESTS'),
              el('div',{style:{display:'flex',gap:'6px'}},
                ...[1,2,3,4,5,6].map(n=>
                  el('button',{
                    style:{width:'34px',height:'34px',borderRadius:'8px',border:'2px solid '+(room.maxGuests===n?'var(--ac)':'var(--line)'),background:room.maxGuests===n?'var(--ac)':'var(--card)',color:room.maxGuests===n?'#fff':'var(--ink)',fontWeight:'700',fontSize:'12px',cursor:'pointer'},
                    onClick:()=>{S.editingRooms[ri].maxGuests=n;render();}
                  },n)
                )
              )
            ),

            // Features - preset chips
            el('div',{},
              el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'6px'}},'FEATURES'),
              el('div',{style:{display:'flex',flexWrap:'wrap',gap:'5px',marginBottom:'7px'}},
                ...FEATURES_LIST.map(feat=>{
                  const on=(room.features||[]).includes(feat);
                  return el('button',{
                    style:{padding:'4px 9px',borderRadius:'999px',border:'1px solid '+(on?'var(--ac)':'var(--line)'),background:on?'var(--ac)':'var(--card)',color:on?'#fff':'var(--ink-s)',fontSize:'11px',fontWeight:'600',cursor:'pointer'},
                    onClick:()=>{
                      S.editingRooms[ri].features = on
                        ? (room.features||[]).filter(f=>f!==feat)
                        : [...(room.features||[]),feat];
                      render();
                    }
                  },feat);
                })
              ),
              // Custom feature input
              el('div',{style:{display:'flex',gap:'6px'}},
                el('input',{class:'inp',style:{flex:1,fontSize:'12px'},placeholder:'Add custom feature...',
                  value:S.roomFeatureInput||'',
                  onInput:e=>setInput({roomFeatureInput:e.target.value}),
                  onKeydown:e=>{
                    if(e.key==='Enter'&&S.roomFeatureInput?.trim()){
                      S.editingRooms[ri].features=[...(room.features||[]),S.roomFeatureInput.trim()];
                      set({roomFeatureInput:''});
                    }
                  }
                }),
                el('button',{class:'btn ba',style:{flexShrink:0,fontSize:'12px'},
                  onClick:()=>{
                    if(S.roomFeatureInput?.trim()){
                      S.editingRooms[ri].features=[...(room.features||[]),S.roomFeatureInput.trim()];
                      set({roomFeatureInput:''});
                    }
                  }
                },'Add')
              )
            )
          );
        })
      ),
      // Footer — Add Room + Save
      el('div',{style:{padding:'12px 16px',borderTop:'1px solid var(--line)',flexShrink:0}},
        // Add new room button
        el('button',{
          style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',
                 padding:'9px',marginBottom:'10px',
                 background:'var(--pd)',border:'2px dashed var(--ac)',borderRadius:'10px',
                 color:'var(--aci)',fontWeight:'700',fontSize:'12px',cursor:'pointer'},
          onClick:()=>{
            const newRoom = {
              id:'cat'+(S.editingRooms.length+1)+'_'+Date.now(),
              label:'New Category '+(S.editingRooms.length+1),
              emoji:'🛏️',
              tag:'Standard',
              tagColor:'good',
              mult: 1,
              maxGuests: 2,
              bedType:'Double Bed',
              size:'200 sq ft',
              features:['AC','WiFi','Hot Water'],
            };
            S.editingRooms = [...S.editingRooms, newRoom];
            render();
            // scroll to new room after render
            setTimeout(()=>{
              const cards = document.querySelectorAll('[data-room-card]');
              if(cards.length) cards[cards.length-1].scrollIntoView({behavior:'smooth',block:'center'});
            }, 100);
          }
        }, ic('plus',14), 'Add New Room Category'),

        // Save / Cancel row
        el('div',{style:{display:'flex',gap:'10px'}},
          el('button',{class:'btn bo',style:{flex:1,justifyContent:'center'},onClick:()=>set({showRoomEditor:false})},'Cancel'),
          el('button',{class:'btn ba',style:{flex:2,justifyContent:'center'},onClick:saveRooms},ic('save',13),'Save All ('+S.editingRooms.length+')')
        )
      )
    )
  );
  return modal;
}

// ══════════════════════════════════════════
// WELCOME ANIMATION
// ══════════════════════════════════════════
function renderWelcome(){
  const name=S.user?.displayName?.split(' ')[0]||'Hotel Owner';
  const div=el('div',{class:'welcome-overlay'},
    el('div',{class:'welcome-emoji'},'🏨'),
    el('div',{style:{textAlign:'center'}},
      el('h1',{style:{color:'#fff',fontSize:'26px',fontFamily:'Fraunces,serif',marginBottom:'6px'}},'Welcome, '+name+'!'),
      el('p',{style:{color:'rgba(255,255,255,.8)',fontSize:'13px',marginBottom:'20px'}},'Your Hotel Admin Panel is ready')
    ),
    el('div',{style:{display:'flex',alignItems:'center',gap:'8px',color:'rgba(255,255,255,.7)',fontSize:'12px'}},
      el('div',{class:'welcome-dots'},
        el('span'),el('span'),el('span')
      ),
      'Loading your dashboard...'
    )
  );
  // Auto fade out
  setTimeout(()=>{
    div.classList.add('out');
  },2600);
  return div;
}

// ══════════════════════════════════════════
// MAIN RENDER
// ══════════════════════════════════════════
function render(){
  const app=document.getElementById('app');
  app.innerHTML='';
  if(!S.authReady){const d=document.createElement('div');d.style.cssText='min-height:100vh;display:flex;align-items:center;justify-content:center;';d.appendChild(sp2());app.appendChild(d);return;}
  if(!S.isAuth){app.appendChild(renderLogin());if(S.toast)app.appendChild(renderToast());return;}

  if(IS_HOTEL){
    // ── HOTEL OWNER PANEL ──
    // Welcome animation (first login)
    if(S.showWelcome){
      app.appendChild(renderWelcome());
      return;
    }
    app.appendChild(renderMobTop());
    // tab content
    const content=
      S.tab==='dashboard'?renderDashH():
      S.tab==='hotel'?renderHotelH():
      S.tab==='bookings'?renderBookingsH():
      S.tab==='reviews'?renderReviewsH():
      S.tab==='plan'?renderPlanH():
      renderSettingsH();
    app.appendChild(content);
    app.appendChild(renderMobNav());
  } else {
    // ── SUPER ADMIN PANEL ──
    const layout=el('div',{class:'layout'},
      renderSidebar(),
      el('div',{class:'main'},
        renderTopbar(),
        renderMobTop(),
        S.tab==='dashboard'?renderDashS():
        S.tab==='hotels'?renderHotelsS():
        S.tab==='payments'?renderPaymentsS():
        S.tab==='admins'?renderAdminsS():
        S.tab==='share'?renderShareS():
        S.tab==='analytics'?renderAnalyticsS():
        S.tab==='bookings'?renderBookingsS():
        S.tab==='website'?renderWebsiteS():
        S.tab==='requests'?renderRequestsS():
        S.tab==='activity'?renderActivityS():
        el('div',{class:'content'},'')
      )
    );
    app.appendChild(layout);
    app.appendChild(renderMobNav());
  }

  // Modals
  if(S.showHotelForm||S.editHotel)app.appendChild(renderHotelForm());
  if(S.showRoomEditor)app.appendChild(renderRoomEditor());
  if(S.showShare)app.appendChild(renderShareModal());
  if(S.showPayment)app.appendChild(renderPaymentModal());
  if(S.delId)app.appendChild(renderConfirm());
  if(S.toast)app.appendChild(renderToast());
}

window.addEventListener('load',()=>{render();initFB();});