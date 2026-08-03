// ================================================================
// admin-hotel-owner.js — HotelRadar Admin Panel
// Hotel Owner ke saare tabs:
// My Plan, Demo Hotel, Dashboard, Hotel Page,
// Room Categories, Bookings, Reviews, Plan, Settings
// Depends on: config.js, admin-core.js
// ================================================================

function getMyPlan(){
  const a=S.myAdmin;if(!a)return{st:'none',label:'No Plan',days:0};
  if(!a.planExpiry)return{st:'free',label:'Free Trial',days:30};
  const days=Math.ceil((new Date(a.planExpiry)-new Date())/(864e5));
  if(days<=0)return{st:'expired',label:'Expired',days:0};
  return{st:a.plan==='paid'?'paid':'free',label:a.plan==='paid'?'Paid Plan':'Free Trial',days};
}

// ── DEMO HOTEL (shown when no hotel added yet, website pe show nahi hoga) ──
const DEMO_HOTEL = {
  id:'demo_preview',
  name:'Your Hotel Name Here',
  city:'Your City',
  state:'Your State',
  area:'Your Area / Locality',
  phone:'+91 XXXXX XXXXX',
  price:2500,
  rating:4.5,
  reviewCount:0,
  type:'hotel',
  plan:'basic',
  emoji:'🏨',
  gradient:'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)',
  desc:'Write your hotel description here. Tell guests about your location, specialities, what makes your hotel unique, nearby attractions, and why they should stay with you.',
  amenities:['AC','WiFi','Restaurant','Parking','Hot Water','TV'],
  badges:[],
  checkIn:'12:00 PM',
  checkOut:'11:00 AM',
  approved:false,
  active:false,
  isDemo:true,
};

// Room categories for preview
function getDemoRooms(basePrice, customRooms){
  // If hotel owner has saved custom rooms, use EXACTLY those — no merging
  if(customRooms && customRooms.length > 0){
    return customRooms.map((r, i) => ({
      // defaults in case some fields are missing
      id: r.id || ('cat'+(i+1)),
      label: r.label || ('Category '+(i+1)),
      emoji: r.emoji || '🛏️',
      tag: r.tag || 'Standard',
      tagColor: r.tagColor || 'good',
      mult: Number(r.mult) || 1,
      maxGuests: Number(r.maxGuests) || 2,
      bedType: r.bedType || 'Double Bed',
      size: r.size || '200 sq ft',
      features: Array.isArray(r.features) ? r.features : [],
    }));
  }
  // Fallback defaults (shown when no custom rooms set)
  return [
    {id:'cat1',label:'Standard Room',emoji:'🛏️',tag:'Best Value',tagColor:'good',mult:1,maxGuests:2,bedType:'Double Bed',size:'180 sq ft',features:['AC','TV','WiFi','Hot Water','Daily Housekeeping']},
    {id:'cat2',label:'Deluxe Room',emoji:'✨',tag:'Most Popular',tagColor:'accent',mult:1.5,maxGuests:2,bedType:'King Bed',size:'240 sq ft',features:['AC','Smart TV','WiFi','Mini Fridge','City View','Room Service']},
    {id:'cat3',label:'Premium Room',emoji:'🌟',tag:'Premium',tagColor:'accent',mult:2,maxGuests:3,bedType:'Super King',size:'300 sq ft',features:['AC','Smart TV','WiFi','Mini Bar','Balcony','Bathtub','24/7 Service']},
  ];
}

function renderDashH(){
  const h=S.myHotel,bk=S.myBookings,rv=S.myReviews;
  const plan=getMyPlan();
  const avgR=rv.length?(rv.reduce((s,r)=>s+Number(r.rating||0),0)/rv.length).toFixed(1):'—';
  return el('div',{class:'content fi'},
    // Plan banner
    el('div',{class:'pl-ban '+(plan.st==='expired'?'pl-exp':plan.st==='paid'?'pl-paid':'pl-free')},
      el('div',{},
        el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)'}},(plan.st==='free'?'🎉 Free Trial Active':plan.st==='paid'?'✅ Paid Plan Active':'⚠️ Plan Expired')),
        el('p',{style:{fontSize:'11px',color:'var(--ink-s)',marginTop:'2px'}},'Valid till: '+fmt(S.myAdmin?.planExpiry)+(plan.days>0?' ('+plan.days+' days left)':''))
      ),
      plan.st==='expired'?el('button',{style:{padding:'7px 14px',background:'#EF4444',color:'#fff',fontWeight:'700',fontSize:'12px',borderRadius:'8px',cursor:'pointer'},onClick:()=>set({showPayment:true})},'Renew Now'):null
    ),
    // Stats
    el('div',{class:'g3',style:{marginBottom:'14px'}},
      el('div',{class:'card scard'},el('div',{style:{fontSize:'22px'}},'👁'),el('div',{class:'sval',style:{color:'var(--blue)'}},h?.reviewCount||0),el('div',{class:'slbl'},'Profile Views')),
      el('div',{class:'card scard'},el('div',{style:{fontSize:'22px'}},'📅'),el('div',{class:'sval',style:{color:'var(--ac)'}},bk.length),el('div',{class:'slbl'},'Bookings')),
      el('div',{class:'card scard'},el('div',{style:{fontSize:'22px'}},'✅'),el('div',{class:'sval',style:{color:'var(--good)'}},bk.filter(b=>b.status==='confirmed').length),el('div',{class:'slbl'},'Confirmed')),
      el('div',{class:'card scard'},el('div',{style:{fontSize:'22px'}},'⭐'),el('div',{class:'sval',style:{color:'#F59E0B'}},avgR),el('div',{class:'slbl'},'Avg Rating'))
    ),
    // Hotel quick card or add prompt
    h?el('div',{class:'card',style:{padding:'14px',marginBottom:'12px'}},
      el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}},
        el('h3',{style:{fontSize:'13px',color:'var(--ink)'}},'Your Hotel'),
        el('button',{style:{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',background:'var(--acd)',color:'var(--aci)',fontWeight:'700',fontSize:'11px',borderRadius:'6px',cursor:'pointer'},onClick:()=>set({tab:'hotel'})},ic('edit',12),'Edit & Manage')
      ),
      el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
        ...[['📍',`${h.area||''}, ${h.city}`],['📞',h.phone||'—'],['💰','₹'+Number(h.price||0).toLocaleString('en-IN')+'/night'],['🏷️',h.approved?'✅ Live on HotelRadar':'⏳ Pending Approval']].map(([e,v])=>
          el('div',{style:{background:'var(--pd)',borderRadius:'8px',padding:'8px'}},
            el('p',{style:{fontSize:'9px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'2px'}},e),
            el('p',{style:{fontSize:'12px',fontWeight:'600',color:'var(--ink)'}},v)
          )
        )
      )
    ):el('div',{class:'card',style:{padding:'20px',marginBottom:'12px',border:'2px dashed var(--line)',background:'var(--pd)',textAlign:'center'}},
      el('p',{style:{fontSize:'28px',marginBottom:'8px'}},'🏨'),
      el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)',marginBottom:'6px'}},'No Hotel Added Yet'),
      el('p',{style:{fontSize:'11px',color:'var(--ink-s)',marginBottom:'14px'}},'Go to "My Hotel" tab to add your hotel listing.'),
      el('button',{class:'btn ba',onClick:()=>set({tab:'hotel'})},ic('plus',13),'Add Hotel Now')
    ),
    // Recent bookings
    el('div',{class:'card',style:{overflow:'hidden'}},
      el('div',{style:{padding:'10px 14px',borderBottom:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between'}},
        el('h3',{style:{fontSize:'13px',color:'var(--ink)'}},'Recent Bookings'),
        el('button',{style:{fontSize:'11px',fontWeight:'700',color:'var(--ac)',cursor:'pointer'},onClick:()=>set({tab:'bookings'})},'View All →')
      ),
      bk.length===0?el('p',{style:{padding:'20px',textAlign:'center',color:'var(--ink-f)',fontSize:'12px'}},'No bookings yet. They will appear here once customers book.'):
      el('div',{},bk.slice().reverse().slice(0,3).map(b=>
        el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 14px',borderBottom:'1px solid var(--line)'}},
          el('div',{},el('p',{style:{fontSize:'12px',fontWeight:'700',color:'var(--ink)'}},b.name||'Guest'),el('p',{style:{fontSize:'10px',color:'var(--ink-s)',marginTop:'1px'}},fmt(b.checkIn))),
          el('span',{class:'b '+(b.status==='confirmed'?'b-g':b.status==='cancelled'?'b-r':'b-a')},b.status||'pending')
        )
      ))
    )
  );
}

// ── HOTEL PAGE — Website jaise UI ──
function renderHotelH(){
  const h=S.myHotel||DEMO_HOTEL;
  const isDemo=!S.myHotel;
  const rooms=getDemoRooms(h.price||2500, h.customRooms);
  const selRoom=S.selectedRoom;

  const wrap=el('div',{style:{paddingBottom:'16px'}});

  // Demo notice banner
  if(isDemo){
    wrap.appendChild(el('div',{style:{background:'linear-gradient(135deg,var(--ac),#f59e0b)',color:'#fff',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px'}},
      el('div',{},
        el('p',{style:{fontSize:'13px',fontWeight:'700'}},'👋 This is a Preview'),
        el('p',{style:{fontSize:'11px',opacity:'.9',marginTop:'2px'}},'Add your hotel details — this is how it will look on HotelRadar')
      ),
      el('button',{style:{flexShrink:0,padding:'7px 14px',background:'rgba(255,255,255,.25)',border:'1px solid rgba(255,255,255,.4)',borderRadius:'8px',color:'#fff',fontWeight:'700',fontSize:'12px',cursor:'pointer'},
        onClick:()=>set({showHotelForm:true,editHotel:null,hf:eH(),hfErr:'',amenityInput:'',hfStep:1})},
        '+ Add Hotel')
    ));
  }

  // Hotel image / gradient card
  const imgCard=el('div',{style:{height:'200px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'64px',background:h.gradient,position:'relative',overflow:'hidden'}},
    el('span',{},h.emoji||'🏨')
  );

  // Edit / Add button overlay
  const editBtn=el('button',{
    style:{position:'absolute',bottom:'12px',right:'12px',display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',background:'rgba(255,255,255,.9)',backdropFilter:'blur(8px)',borderRadius:'999px',fontWeight:'700',fontSize:'12px',color:'var(--ink)',cursor:'pointer',border:'none',boxShadow:'0 2px 8px rgba(0,0,0,.2)'},
    onClick:()=>set({showHotelForm:true,editHotel:isDemo?null:h,hf:isDemo?eH():{...h,price:String(h.price||''),rating:String(h.rating||'4.5'),reviewCount:String(h.reviewCount||0)},hfErr:'',amenityInput:''})
  },ic('edit',13),isDemo?'Add Hotel':'Edit Hotel');
  imgCard.style.position='relative';
  imgCard.appendChild(editBtn);
  wrap.appendChild(imgCard);

  // ── ROOM CATEGORIES STRIP — with inline Edit & Delete ──
  const roomStrip=el('div',{style:{padding:'14px 16px 0'}},
    el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}},
      el('p',{style:{fontSize:'10px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'.08em',color:'var(--ink-f)'}},'🛏 Room Categories'),
      isDemo?null:el('button',{
        style:{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',background:'var(--acd)',color:'var(--aci)',fontWeight:'700',fontSize:'10px',borderRadius:'6px',cursor:'pointer'},
        onClick:()=>set({showRoomEditor:true,editingRooms:JSON.parse(JSON.stringify(rooms))})
      },ic('plus',11),'Add / Edit All')
    ),

    // Room cards — each with its own Edit and Delete
    el('div',{style:{display:'flex',flexDirection:'column',gap:'10px'}},
      ...rooms.map((room,ri)=>{
        const price=Math.round(h.price*room.mult);
        const card=el('div',{
          style:{background:'var(--card)',border:'1px solid var(--line)',borderRadius:'14px',overflow:'hidden'}
        });

        // Card header — emoji + name + price + action buttons
        card.appendChild(el('div',{style:{display:'flex',alignItems:'center',gap:'10px',padding:'12px 14px',borderBottom:'1px solid var(--line)',background:'var(--pd)'}},
          el('span',{style:{fontSize:'26px'}},room.emoji),
          el('div',{style:{flex:1}},
            el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)'}},room.label),
            el('p',{style:{fontSize:'11px',color:'var(--ink-s)',marginTop:'1px'}},room.bedType+' · '+room.size+' · Max '+room.maxGuests+' guests')
          ),
          el('div',{style:{textAlign:'right',flexShrink:0}},
            el('p',{style:{fontSize:'15px',fontWeight:'700',color:'var(--ink)'}},'₹'+price.toLocaleString('en-IN')),
            el('p',{style:{fontSize:'9px',color:'var(--ink-f)'}},'per night')
          )
        ));

        // Features row
        card.appendChild(el('div',{style:{padding:'10px 14px',borderBottom:'1px solid var(--line)'}},
          el('div',{style:{display:'flex',flexWrap:'wrap',gap:'5px'}},
            ...(room.features||[]).map(f=>
              el('span',{style:{padding:'3px 8px',background:'var(--gd)',color:'var(--good)',borderRadius:'999px',fontSize:'10px',fontWeight:'700'}},f)
            )
          )
        ));

        // Action buttons — Edit inline + Delete
        if(!isDemo){
          card.appendChild(el('div',{style:{display:'flex',gap:'0',borderTop:'none'}},
            el('button',{
              style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',padding:'9px',fontSize:'12px',fontWeight:'700',color:'var(--aci)',background:'var(--acd)',border:'none',cursor:'pointer',borderBottomLeftRadius:'14px',transition:'background .12s'},
              onClick:()=>{
                // Open room editor focused on this room
                const editRooms=JSON.parse(JSON.stringify(rooms));
                set({showRoomEditor:true, editingRooms:editRooms, roomEditorFocus:ri});
              }
            },ic('edit',13),'Edit Room'),
            el('div',{style:{width:'1px',background:'var(--line)'}}),
            el('button',{
              style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',padding:'9px',fontSize:'12px',fontWeight:'700',color:'#DC2626',background:'#FEF2F2',border:'none',cursor:'pointer',borderBottomRightRadius:'14px',transition:'background .12s'},
              onClick:()=>{
                if(!confirm('Delete "'+room.label+'" category? This cannot be undone.')){return;}
                const updRooms=rooms.filter((_,i)=>i!==ri);
                const hotelId=S.myHotel?.id;
                if(hotelId){
                  db.ref('hotels/'+hotelId).update({customRooms:updRooms}).then(()=>{
                    toast(room.label+' deleted.');
                  }).catch(e=>toast('Delete failed: '+e.message,'err'));
                }
              }
            },ic('trash',13),'Delete')
          ));
        }

        return card;
      })
    )
  );
  wrap.appendChild(roomStrip);

  // Hotel info section
  const info=el('div',{style:{padding:'14px 16px 0'}});

  // Status badge
  if(!isDemo){
    info.appendChild(el('div',{style:{marginBottom:'10px'}},
      el('span',{class:'b '+(h.approved?'b-g':'b-a'),style:{fontSize:'11px'}},h.approved?'✅ Live on HotelRadar':'⏳ Pending Admin Approval')
    ));
  }

  // Name + location
  info.appendChild(el('h2',{style:{fontSize:'20px',fontFamily:'Fraunces,serif',color:'var(--ink)',marginBottom:'4px'}},h.name));
  info.appendChild(el('p',{style:{fontSize:'12px',color:'var(--ink-s)',marginBottom:'12px'}},`${h.area||''}, ${h.city}${h.state?', '+h.state:''}`));

  // Price + check-in/out
  info.appendChild(el('div',{class:'card',style:{padding:'14px',marginBottom:'12px'}},
    el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}},
      el('div',{},
        el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',textTransform:'uppercase',letterSpacing:'.06em'}},'Starting Direct Rate'),
        el('p',{style:{fontSize:'22px',fontWeight:'700',color:'var(--ink)',fontFamily:'Fraunces,serif'}},'₹'+Number(h.price||0).toLocaleString('en-IN')+'  ',el('span',{style:{fontSize:'12px',fontWeight:'400',color:'var(--ink-s)'}},' /night'))
      ),
      el('span',{class:'b b-g',style:{fontSize:'11px',padding:'5px 10px'}},'Zero Commission')
    ),
    el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}},
      el('div',{style:{background:'var(--pd)',borderRadius:'8px',padding:'8px'}},el('p',{style:{fontSize:'9px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'2px'}},'CHECK-IN'),el('p',{style:{fontSize:'12px',fontWeight:'600',color:'var(--ink)'}},h.checkIn||'12:00 PM')),
      el('div',{style:{background:'var(--pd)',borderRadius:'8px',padding:'8px'}},el('p',{style:{fontSize:'9px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'2px'}},'CHECK-OUT'),el('p',{style:{fontSize:'12px',fontWeight:'600',color:'var(--ink)'}},h.checkOut||'11:00 AM'))
    )
  ));

  // Description
  if(h.desc){
    info.appendChild(el('div',{class:'card',style:{padding:'14px',marginBottom:'12px'}},
      el('p',{style:{fontSize:'12px',color:'var(--ink-s)',lineHeight:'1.7'}},h.desc)
    ));
  }

  // Amenities
  if(h.amenities?.length){
    info.appendChild(el('div',{class:'card',style:{padding:'14px',marginBottom:'12px'}},
      el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'10px'}},'Featured Amenities'),
      el('div',{style:{display:'flex',flexWrap:'wrap',gap:'7px'}},
        ...h.amenities.map(a=>el('span',{style:{padding:'5px 10px',background:'var(--pd)',border:'1px solid var(--line)',borderRadius:'999px',fontSize:'11px',fontWeight:'600',color:'var(--ink-s)'}},a))
      )
    ));
  }

  // Edit hotel button
  info.appendChild(el('button',{
    class:'btn ba',
    style:{width:'100%',justifyContent:'center',padding:'13px',fontSize:'14px'},
    onClick:()=>set({showHotelForm:true,editHotel:isDemo?null:h,hf:isDemo?eH():{...h,price:String(h.price||''),rating:String(h.rating||'4.5'),reviewCount:String(h.reviewCount||0)},hfErr:'',amenityInput:''})
  },ic(isDemo?'plus':'edit',15),isDemo?'Add Your Hotel Details':'Edit Hotel Details'));

  wrap.appendChild(info);
  return wrap;
}

function renderBookingsH(){
  const bk=S.myBookings;
  return el('div',{class:'content fi'},
    el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}},
      el('h2',{style:{fontSize:'17px',color:'var(--ink)'}},'Booking Requests'),
      el('span',{class:'b b-b'},bk.length+' total')
    ),
    bk.length===0?el('div',{class:'card',style:{padding:'48px',textAlign:'center'}},
      el('p',{style:{fontSize:'32px',marginBottom:'10px'}},'📅'),
      el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)',marginBottom:'6px'}},'No Bookings Yet'),
      el('p',{style:{fontSize:'12px',color:'var(--ink-s)'}},'Customer booking requests will appear here.')
    ):el('div',{style:{display:'flex',flexDirection:'column',gap:'10px'}},
      ...bk.slice().reverse().map(b=>
        el('div',{class:'card',style:{padding:'14px'}},
          el('div',{style:{display:'flex',justifyContent:'space-between',gap:'8px',marginBottom:'10px'}},
            el('div',{},el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)'}},b.name||'Guest'),el('p',{style:{fontSize:'11px',color:'var(--ink-s)',marginTop:'2px'}},'📞 '+b.phone)),
            el('span',{class:'b '+(b.status==='confirmed'?'b-g':b.status==='cancelled'?'b-r':'b-a')},b.status||'pending')
          ),
          el('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'10px'}},
            ...[['📅 Check-in',fmt(b.checkIn)],['📅 Check-out',fmt(b.checkOut)],['👥 Guests',b.guests+' guests'],['🚪 Rooms',b.rooms+' room(s)']].map(([l,v])=>
              el('div',{style:{background:'var(--pd)',borderRadius:'8px',padding:'7px'}},
                el('p',{style:{fontSize:'9px',fontWeight:'700',color:'var(--ink-f)',marginBottom:'2px'}},l),
                el('p',{style:{fontSize:'11px',fontWeight:'600',color:'var(--ink)'}},v)
              )
            )
          ),
          b.requests&&el('div',{style:{padding:'7px 10px',background:'var(--acd)',borderRadius:'8px',marginBottom:'8px',fontSize:'11px',color:'var(--aci)'}},'📝 '+b.requests),
          (!b.status||b.status==='pending')&&el('div',{style:{display:'flex',gap:'8px'}},
            el('button',{class:'btn bg',style:{flex:1,justifyContent:'center'},onClick:()=>updBooking(b.id,'confirmed')},ic('check',12),'Confirm'),
            el('button',{class:'btn br',style:{flex:1,justifyContent:'center'},onClick:()=>updBooking(b.id,'cancelled')},ic('x',12),'Cancel'),
            el('button',{class:'btn bo',style:{padding:'9px 12px'},onClick:()=>set({delId:b.id,delType:'booking'})},ic('trash',12))
          )
        )
      )
    )
  );
}

function renderReviewsH(){
  const rv=S.myReviews;
  const avg=rv.length?(rv.reduce((s,r)=>s+Number(r.rating||0),0)/rv.length).toFixed(1):'—';
  return el('div',{class:'content fi'},
    el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px'}},
      el('h2',{style:{fontSize:'17px',color:'var(--ink)'}},'Customer Reviews'),
      el('div',{},el('span',{style:{fontSize:'18px',fontWeight:'700',color:'#F59E0B',fontFamily:'Fraunces,serif'}},avg),el('span',{style:{fontSize:'11px',color:'var(--ink-f)'}},' / 5 · '+rv.length+' reviews'))
    ),
    rv.length===0?el('div',{class:'card',style:{padding:'48px',textAlign:'center'}},
      el('p',{style:{fontSize:'32px',marginBottom:'10px'}},'⭐'),
      el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)',marginBottom:'6px'}},'No Reviews Yet')
    ):el('div',{class:'card',style:{overflow:'hidden'}},
      ...rv.map((r,i)=>el('div',{class:'rv',style:{background:i%2?'var(--pd)':'var(--card)'}},
        el('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'8px',marginBottom:'5px'}},
          el('div',{},el('p',{style:{fontSize:'12px',fontWeight:'700',color:'var(--ink)'}},r.userName||'Anonymous'),el('div',{class:'stars',style:{fontSize:'12px'}},starsStr(r.rating))),
          el('div',{style:{display:'flex',alignItems:'center',gap:'6px'}},
            el('span',{style:{fontSize:'10px',color:'var(--ink-f)'}},fmt(r.date)),
            el('button',{style:{display:'flex',alignItems:'center',padding:'3px',background:'#FEF2F2',color:'#EF4444',borderRadius:'5px',cursor:'pointer'},onClick:()=>set({delId:r.id,delType:'review'})},ic('trash',11))
          )
        ),
        r.comment&&el('p',{style:{fontSize:'11px',color:'var(--ink-s)',lineHeight:'1.55'}},r.comment)
      ))
    )
  );
}

function renderPlanH(){
  const plan=getMyPlan();
  return el('div',{class:'content fi'},
    el('h2',{style:{fontSize:'17px',color:'var(--ink)',marginBottom:'14px'}},'My Plan & Billing'),
    el('div',{class:'card',style:{padding:'18px',marginBottom:'14px',border:'2px solid '+(plan.st==='expired'?'#FCA5A5':plan.st==='paid'?'#93C5FD':'#86EFAC')}},
      el('div',{style:{display:'flex',gap:'12px',alignItems:'center',marginBottom:'12px'}},
        el('div',{style:{fontSize:'30px'}},plan.st==='expired'?'⚠️':plan.st==='paid'?'💳':'🎉'),
        el('div',{},
          el('h3',{style:{fontSize:'15px',color:'var(--ink)'}},(plan.st==='free'?'Free Trial Active':plan.st==='paid'?'Paid Plan Active':'Plan Expired')),
          el('p',{style:{fontSize:'11px',color:'var(--ink-s)',marginTop:'3px'}},plan.st==='expired'?'Renew to keep hotel listed.':plan.st==='paid'?`Active till ${fmt(S.myAdmin?.planExpiry)}`:`Trial ends ${fmt(S.myAdmin?.planExpiry)} · ${plan.days} days left`)
        )
      ),
      plan.st==='expired'&&el('button',{style:{width:'100%',padding:'10px',background:'#EF4444',color:'#fff',fontWeight:'700',fontSize:'13px',borderRadius:'8px',cursor:'pointer'},onClick:()=>set({showPayment:true})},'🔄 Renew Now')
    ),
    el('h3',{style:{fontSize:'13px',color:'var(--ink)',marginBottom:'10px'}},'Choose Plan'),
    el('div',{style:{display:'flex',flexDirection:'column',gap:'10px',marginBottom:'16px'}},
      el('div',{class:'card',style:{padding:'14px',border:'2px solid var(--good)',cursor:'pointer'},onClick:()=>set({showPayment:true,payOpt:'monthly'})},
        el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between'}},
          el('div',{},el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)'}},'Monthly Plan'),el('p',{style:{fontSize:'11px',color:'var(--ink-s)'}},'Unlimited bookings · Full dashboard')),
          el('div',{style:{textAlign:'right'}},el('p',{style:{fontSize:'18px',fontWeight:'700',color:'var(--good)',fontFamily:'Fraunces,serif'}},'₹999'),el('p',{style:{fontSize:'10px',color:'var(--ink-f)'}},'per month'))
        )
      ),
      el('div',{class:'card',style:{padding:'14px',border:'2px solid var(--blue)',cursor:'pointer'},onClick:()=>set({showPayment:true,payOpt:'perbooking'})},
        el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between'}},
          el('div',{},el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)'}},'Pay Per Booking'),el('p',{style:{fontSize:'11px',color:'var(--ink-s)'}},'Pay only when you earn')),
          el('div',{style:{textAlign:'right'}},el('p',{style:{fontSize:'18px',fontWeight:'700',color:'var(--blue)',fontFamily:'Fraunces,serif'}},'₹49'),el('p',{style:{fontSize:'10px',color:'var(--ink-f)'}},'per booking'))
        )
      )
    ),
    el('div',{style:{padding:'12px 14px',background:'var(--acd)',borderRadius:'10px',border:'1px solid rgba(232,99,28,.15)'}},
      el('p',{style:{fontSize:'11px',color:'var(--aci)',lineHeight:'1.7',fontWeight:'600'}},'💬 Contact HotelRadar admin to activate. We will confirm and activate within minutes.')
    )
  );
}

function renderSettingsH(){
  const u=S.user;
  return el('div',{class:'content fi'},
    el('h2',{style:{fontSize:'17px',color:'var(--ink)',marginBottom:'14px'}},'Account Settings'),
    el('div',{class:'card',style:{padding:'16px',marginBottom:'12px'}},
      el('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px',paddingBottom:'12px',borderBottom:'1px solid var(--line)'}},
        u.photoURL?el('img',{src:u.photoURL,style:{width:'44px',height:'44px',borderRadius:'50%',objectFit:'cover'}}):
          el('div',{style:{width:'44px',height:'44px',borderRadius:'50%',background:'var(--ac)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'700',fontSize:'18px'}},(u.email||'U')[0].toUpperCase()),
        el('div',{},el('p',{style:{fontSize:'14px',fontWeight:'700',color:'var(--ink)'}},u.displayName||'Hotel Owner'),el('p',{style:{fontSize:'12px',color:'var(--ink-s)'}},u.email))
      ),
      ...[['Plan',S.myAdmin?.plan==='paid'?'Paid ₹999/mo':'Free Trial'],['Expiry',fmt(S.myAdmin?.planExpiry)],['Access','Hotel Admin Panel']].map(([l,v])=>
        el('div',{style:{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--line)'}},
          el('span',{style:{fontSize:'12px',color:'var(--ink-f)',fontWeight:'600'}},l),
          el('span',{style:{fontSize:'12px',color:'var(--ink)',fontWeight:'700'}},v)
        )
      )
    ),
    el('div',{class:'card',style:{padding:'16px',border:'1px solid #FECACA'}},
      el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between'}},
        el('div',{},el('p',{style:{fontSize:'12px',fontWeight:'700',color:'var(--ink)'}},'Sign Out'),el('p',{style:{fontSize:'10px',color:'var(--ink-s)'}},'You will need to sign in again')),
        el('button',{class:'btn br',style:{fontSize:'12px'},onClick:doSignOut},ic('logout',13),'Sign Out')
      )
    )
  );
}

// ══════════════════════════════════════════
// HOTEL FORM MODAL
// ══════════════════════════════════════════
