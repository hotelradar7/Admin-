// ================================================================
// admin-super.js — HotelRadar Admin Panel
// Super Admin ke saare tabs:
// Dashboard, Hotels, Payments, Admins, Share Access,
// Analytics, Bookings, Website Settings,
// Hotel Requests, Activity Log
// Depends on: config.js, admin-core.js
// ================================================================

function renderDashS(){
  const pending=S.hotels.filter(h=>!h.approved);
  const totalRev=S.payments.reduce((s,p)=>s+Number(p.amount||0),0);
  const topQ=getTopQ();
  const due=S.sharedAdmins.filter(a=>a.planExpiry&&new Date(a.planExpiry)<new Date());
  return el('div',{class:'content fi'},
    el('div',{class:'g3',style:{marginBottom:'16px'}},
      mkStat(S.hotels.length,'Hotels','var(--ac)','hotel'),
      mkStat(S.sharedAdmins.length,'Admins','var(--blue)','users'),
      mkStat('₹'+totalRev.toLocaleString('en-IN'),'Revenue','var(--good)','money'),
      mkStat(S.bookings.length,'Bookings','var(--pur)','book')
    ),
    // Pending + searches
    el('div',{class:'g2',style:{gap:'14px',marginBottom:'14px'}},
      el('div',{class:'card',style:{padding:'14px'}},
        el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'10px'}},
          el('h3',{style:{fontSize:'13px',color:'var(--ink)'}},'Pending Approval'),
          el('span',{class:'b b-a'},pending.length)
        ),
        pending.length===0?el('p',{style:{fontSize:'12px',color:'var(--ink-f)',textAlign:'center',padding:'14px 0'}},'All approved ✓'):
        el('div',{},pending.slice(0,4).map(h=>
          el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px',padding:'7px 0',borderBottom:'1px solid var(--line)'}},
            el('div',{},el('p',{style:{fontSize:'12px',fontWeight:'700',color:'var(--ink)'}},h.name),el('p',{style:{fontSize:'10px',color:'var(--ink-s)'}},h.city)),
            el('div',{style:{display:'flex',gap:'4px'}},
              el('button',{class:'btn bg',style:{padding:'4px 9px',fontSize:'10px'},onClick:async()=>{await togF(h.id,'approved',true);toast(h.name+' approved!');}},ic('check',10),'OK'),
              el('button',{class:'btn br',style:{padding:'4px 9px',fontSize:'10px'},onClick:()=>set({delId:h.id,delType:'hotel'})},ic('trash',10))
            )
          )
        ))
      ),
      el('div',{class:'card',style:{padding:'14px'}},
        el('h3',{style:{fontSize:'13px',color:'var(--ink)',marginBottom:'10px'}},'Top Searches'),
        topQ.length===0?el('p',{style:{fontSize:'12px',color:'var(--ink-f)',textAlign:'center',padding:'14px 0'}},'No data yet'):
        el('div',{},topQ.slice(0,6).map((s,i)=>
          el('div',{style:{display:'flex',alignItems:'center',gap:'8px',padding:'5px 0',borderBottom:i<5?'1px solid var(--line)':'none'}},
            el('span',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',width:'14px'}},(i+1)+'.'),
            el('span',{style:{flex:1,fontSize:'12px',fontWeight:'600'}},s.q),
            el('span',{class:'b b-b'},s.c+'x')
          )
        ))
      )
    ),
    // Overdue
    due.length>0&&el('div',{class:'card',style:{padding:'14px',marginBottom:'14px',background:'#FEF2F2',border:'1px solid #FECACA'}},
      el('h3',{style:{fontSize:'13px',color:'#DC2626',marginBottom:'10px',display:'flex',alignItems:'center',gap:'6px'}},ic('warn',14),'Overdue Payments'),
      el('div',{},due.map(a=>
        el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px',padding:'7px 0',borderBottom:'1px solid #FECACA'}},
          el('div',{},el('p',{style:{fontSize:'12px',fontWeight:'700',color:'var(--ink)'}},a.email),el('p',{style:{fontSize:'10px',color:'#DC2626'}},'Expired: '+fmt(a.planExpiry))),
          el('button',{class:'btn bg',style:{padding:'5px 10px',fontSize:'10px'},onClick:()=>markPaid(a.key)},ic('check',10),'Mark Paid')
        )
      ))
    ),
    // Quick actions
    el('div',{class:'g2'},
      el('button',{style:{display:'flex',alignItems:'center',gap:'8px',padding:'14px',background:'var(--acd)',border:'1px solid rgba(232,99,28,.2)',borderRadius:'var(--r2)',fontSize:'13px',fontWeight:'700',color:'var(--aci)',cursor:'pointer'},
        onClick:()=>set({showHotelForm:true,editHotel:null,hf:eH(),hfErr:'',amenityInput:'',hfStep:1})},
        ic('plus',16),'Add Hotel'),
      el('button',{style:{display:'flex',alignItems:'center',gap:'8px',padding:'14px',background:'var(--card)',border:'1px solid var(--line)',borderRadius:'var(--r2)',fontSize:'13px',fontWeight:'700',color:'var(--ink)',cursor:'pointer'},
        onClick:()=>set({tab:'share'})},
        ic('share',16),'Share Access')
    )
  );
}

function getTopQ(){
  const c={};S.searchLogs.forEach(l=>{if(l.query)c[l.query]=(c[l.query]||0)+1;});
  return Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([q,count])=>({q,c:count}));
}
function mkStat(v,l,color,i){
  return el('div',{class:'card scard'},
    el('div',{style:{color,marginBottom:'6px'}},ic(i,20)),
    el('div',{class:'sval',style:{color}},String(v)),
    el('div',{class:'slbl'},l)
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN — HOTELS
// ══════════════════════════════════════════
function renderHotelsS(){
  const filtered=S.hotels.filter(h=>{
    const q=(S.hotelSearch||'').toLowerCase();
    const ms=!q||h.name?.toLowerCase().includes(q)||h.city?.toLowerCase().includes(q)||(h.phone||'').includes(q);
    const mf=S.hotelFilter==='all'?true:S.hotelFilter==='approved'?h.approved:S.hotelFilter==='pending'?!h.approved:!h.active;
    return ms&&mf;
  });
  return el('div',{class:'content fi'},
    el('div',{style:{display:'flex',gap:'10px',marginBottom:'14px',flexWrap:'wrap'}},
      el('div',{style:{position:'relative',flex:1,minWidth:'160px'}},
        el('input',{class:'inp',placeholder:'Search hotels...',value:S.hotelSearch||'',onInput:e=>{S.hotelSearch=e.target.value;clearTimeout(window._hs);window._hs=setTimeout(()=>render(),300);}})),
      el('select',{class:'inp',style:{width:'auto'},onChange:e=>set({hotelFilter:e.target.value})},
        ...['all','approved','pending','inactive'].map(v=>el('option',{value:v,...(S.hotelFilter===v?{selected:true}:{})},v.charAt(0).toUpperCase()+v.slice(1))))
      // Hotel owners add hotels from their own Small Admin Panel
    ),
    el('div',{style:{overflowX:'auto'}},
      el('table',{class:'tbl'},
        el('thead',{},el('tr',{},['','Hotel','City','Price','Plan','Status','Actions'].map(h=>el('th',{},h)))),
        el('tbody',{},
          filtered.length===0?[el('tr',{},el('td',{colspan:'7',style:{textAlign:'center',color:'var(--ink-f)',padding:'40px'}},'No hotels'))]:
          filtered.map(h=>el('tr',{},
            el('td',{style:{fontSize:'18px'}},h.emoji||'🏨'),
            el('td',{},el('div',{style:{fontWeight:'700',fontSize:'12px'}},h.name),el('div',{style:{fontSize:'10px',color:'var(--ink-s)'}},h.area||'')),
            el('td',{},h.city),
            el('td',{style:{fontWeight:'700'}},'₹'+Number(h.price||0).toLocaleString('en-IN')),
            el('td',{},el('span',{class:'b '+(h.plan==='spotlight'?'b-p':h.plan==='priority'?'b-b':'b-a')},h.plan||'basic')),
            el('td',{},h.approved?el('span',{class:'b b-g'},'Live'):el('span',{class:'b b-r'},'Pending')),
            el('td',{},el('div',{style:{display:'flex',gap:'4px'}},
              el('button',{class:'btn',style:{padding:'4px 7px',background:h.approved?'var(--gd)':'#FEF3C7',color:h.approved?'var(--good)':'#92400E'},onClick:async()=>{await togF(h.id,'approved',!h.approved);toast(h.approved?'Unapproved':'Approved!');}},ic(h.approved?'check':'warn',11)),
              el('button',{class:'btn',style:{padding:'4px 7px',background:'var(--pd)',color:'var(--ink-s)'},onClick:()=>set({editHotel:h,showHotelForm:true,hf:{...h,price:String(h.price||''),rating:String(h.rating||'4.5'),reviewCount:String(h.reviewCount||0)},hfErr:'',amenityInput:''})},ic('edit',11)),
              el('button',{class:'btn',style:{padding:'4px 7px',background:'#FEF2F2',color:'#EF4444'},onClick:()=>set({delId:h.id,delType:'hotel'})},ic('trash',11))
            ))
          ))
        )
      )
    )
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN — PAYMENTS
// ══════════════════════════════════════════
function renderPaymentsS(){
  const due=S.sharedAdmins.filter(a=>a.planExpiry&&new Date(a.planExpiry)<new Date());
  const total=S.payments.reduce((s,p)=>s+Number(p.amount||0),0);
  return el('div',{class:'content fi'},
    el('div',{class:'g3',style:{marginBottom:'16px'}},
      mkStat('₹'+total.toLocaleString('en-IN'),'Total Earned','var(--good)','money'),
      mkStat(S.payments.length,'Payments','var(--blue)','check'),
      mkStat(due.length,'Overdue','#EF4444','warn')
    ),
    el('div',{class:'card',style:{overflow:'hidden',marginBottom:'14px'}},
      el('div',{style:{padding:'12px 16px',borderBottom:'1px solid var(--line)'}},el('h3',{style:{fontSize:'13px',color:'var(--ink)'}},'Hotel Admin Plans')),
      el('table',{class:'tbl'},
        el('thead',{},el('tr',{},['Email','Plan','Expiry','Actions'].map(h=>el('th',{},h)))),
        el('tbody',{},
          S.sharedAdmins.length===0?[el('tr',{},el('td',{colspan:'4',style:{textAlign:'center',color:'var(--ink-f)',padding:'30px'}},'No admins yet'))]:
          S.sharedAdmins.map(a=>{
            const exp=a.planExpiry&&new Date(a.planExpiry)<new Date();
            return el('tr',{},
              el('td',{style:{fontWeight:'600',fontSize:'12px'}},a.email),
              el('td',{},el('span',{class:'b '+(a.plan==='paid'?'b-g':'b-a')},a.plan==='paid'?'Paid':'Free')),
              el('td',{style:{color:exp?'#EF4444':'var(--ink)',fontSize:'12px'}},fmt(a.planExpiry)+(exp?' ⚠️':'')),
              el('td',{},el('div',{style:{display:'flex',gap:'4px'}},
                el('button',{class:'btn bg',style:{padding:'4px 9px',fontSize:'10px'},onClick:()=>markPaid(a.key)},ic('check',10),'Paid'),
                el('button',{class:'btn br',style:{padding:'4px 9px',fontSize:'10px'},onClick:()=>revokeAdmin(a.key)},ic('x',10),'Revoke')
              ))
            );
          })
        )
      )
    ),
    S.payments.length>0&&el('div',{class:'card',style:{overflow:'hidden'}},
      el('div',{style:{padding:'12px 16px',borderBottom:'1px solid var(--line)'}},el('h3',{style:{fontSize:'13px',color:'var(--ink)'}},'Payment History')),
      el('table',{class:'tbl'},
        el('thead',{},el('tr',{},['Admin','Amount','Date','Status'].map(h=>el('th',{},h)))),
        el('tbody',{},S.payments.map(p=>el('tr',{},
          el('td',{},p.adminEmail||'—'),
          el('td',{style:{fontWeight:'700',color:'var(--good)'}},'₹'+Number(p.amount||0).toLocaleString('en-IN')),
          el('td',{},fmt(p.date)),
          el('td',{},el('span',{class:'b '+(p.status==='paid'?'b-g':'b-r')},p.status||'—'))
        )))
      )
    )
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN — ADMINS
// ══════════════════════════════════════════
function renderAdminsS(){
  return el('div',{class:'content fi'},
    el('div',{style:{display:'flex',justifyContent:'flex-end',marginBottom:'14px'}},
      el('button',{class:'btn ba',onClick:()=>set({showShare:true,shareEmail:'',shareErr:'',genLink:''})},ic('share',13),'Share Access')
    ),
    el('div',{class:'card',style:{overflow:'hidden'}},
      el('table',{class:'tbl'},
        el('thead',{},el('tr',{},['Email','Plan','Active','Expiry','Actions'].map(h=>el('th',{},h)))),
        el('tbody',{},
          S.sharedAdmins.length===0?[el('tr',{},el('td',{colspan:'5',style:{textAlign:'center',color:'var(--ink-f)',padding:'36px'}},'No hotel admins yet'))]:
          S.sharedAdmins.map(a=>{
            const exp=a.planExpiry&&new Date(a.planExpiry)<new Date();
            const link=`${location.origin}${location.pathname}?admin=${encodeURIComponent(a.email)}`;
            return el('tr',{},
              el('td',{style:{fontWeight:'600',fontSize:'12px'}},a.email),
              el('td',{},el('span',{class:'b '+(a.plan==='paid'?'b-g':'b-a')},a.plan==='paid'?'₹999/mo':'Free')),
              el('td',{},el('div',{class:'tog'+(a.active?' on':''),onClick:()=>db.ref(`sharedAdmins/${a.key}`).update({active:!a.active})})),
              el('td',{style:{color:exp?'#EF4444':'var(--ink)',fontSize:'12px'}},fmt(a.planExpiry)+(exp?' ⚠️':'')),
              el('td',{},el('div',{style:{display:'flex',gap:'4px'}},
                el('button',{class:'btn',style:{padding:'4px 8px',fontSize:'10px',background:'var(--bd)',color:'var(--blue)'},
                  onClick:()=>{navigator.clipboard.writeText(link);toast('Link copied!');}},ic('copy',10),'Link'),
                el('button',{class:'btn bg',style:{padding:'4px 8px',fontSize:'10px'},onClick:()=>markPaid(a.key)},ic('check',10),'Paid'),
                el('button',{class:'btn br',style:{padding:'4px 8px',fontSize:'10px'},onClick:()=>revokeAdmin(a.key)},ic('x',10),'Revoke')
              ))
            );
          })
        )
      )
    )
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN — SHARE ACCESS
// ══════════════════════════════════════════
function renderShareS(){
  return el('div',{class:'content fi'},
    el('div',{class:'g2',style:{gap:'16px'}},
      el('div',{class:'card',style:{padding:'18px'}},
        el('h3',{style:{fontSize:'15px',color:'var(--ink)',marginBottom:'6px'}},'Share Hotel Admin Access'),
        el('p',{style:{fontSize:'12px',color:'var(--ink-s)',lineHeight:'1.6',marginBottom:'14px'}},'Enter hotel owner Gmail → Unique link generated automatically → Share link with owner → They login with Google → See their own Hotel Admin Panel.'),
        S.shareErr?el('div',{style:{display:'flex',alignItems:'center',gap:'6px',padding:'8px 12px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'8px',marginBottom:'10px',fontSize:'12px',color:'#DC2626'}},ic('warn',12),S.shareErr):null,
        lbl('Hotel Owner Gmail *'),
        el('input',{class:'inp',type:'email',placeholder:'owner@gmail.com',value:S.shareEmail,style:{marginBottom:'12px'},onInput:e=>setInput({shareEmail:e.target.value}),onKeydown:e=>e.key==='Enter'&&shareAdmin()}),
        el('button',{class:'btn ba btn-w',disabled:S.shareSaving,onClick:shareAdmin},S.shareSaving?sp():ic('share',13),S.shareSaving?'Generating...':'Generate Link & Share Access'),
        S.genLink?el('div',{style:{marginTop:'14px'}},
          el('p',{style:{fontSize:'10px',fontWeight:'700',color:'var(--good)',marginBottom:'6px'}},'✅ Link ready! Share with hotel owner:'),
          el('div',{class:'lbx'},el('span',{style:{flex:1}},S.genLink),
            el('button',{style:{flexShrink:0,display:'flex',alignItems:'center',gap:'3px',padding:'5px 9px',background:'var(--ac)',color:'#fff',fontWeight:'700',fontSize:'11px',borderRadius:'6px'},
              onClick:()=>{navigator.clipboard.writeText(S.genLink);toast('Copied!');}},ic('copy',11),'Copy')
          )
        ):null,
        el('div',{style:{marginTop:'14px',padding:'12px',background:'var(--gd)',borderRadius:'var(--r)'}},
          el('p',{style:{fontSize:'11px',color:'var(--good)',lineHeight:'1.7',fontWeight:'600'}},'✓ 30 days FREE trial\n✓ After: ₹999/month or ₹49/booking\n✓ They see only their hotel data')
        )
      ),
      el('div',{class:'card',style:{padding:'18px'}},
        el('h3',{style:{fontSize:'14px',color:'var(--ink)',marginBottom:'12px'}},'Active Hotel Admins ('+S.sharedAdmins.length+')'),
        S.sharedAdmins.length===0?el('p',{style:{fontSize:'12px',color:'var(--ink-f)',textAlign:'center',padding:'20px 0'}},'No hotel admins yet'):
        el('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
          ...S.sharedAdmins.map(a=>{
            const exp=a.planExpiry&&new Date(a.planExpiry)<new Date();
            const link=`${location.origin}${location.pathname}?admin=${encodeURIComponent(a.email)}`;
            return el('div',{style:{padding:'10px 12px',background:exp?'#FEF2F2':'var(--pd)',borderRadius:'var(--r)',border:'1px solid '+(exp?'#FECACA':'var(--line)')}},
              el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'8px'}},
                el('div',{style:{minWidth:0}},
                  el('p',{style:{fontSize:'12px',fontWeight:'700',color:'var(--ink)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},a.email),
                  el('p',{style:{fontSize:'10px',color:exp?'#DC2626':'var(--ink-s)'}},exp?'⚠️ Expired: '+fmt(a.planExpiry):'Valid: '+fmt(a.planExpiry))
                ),
                el('div',{style:{display:'flex',gap:'4px',flexShrink:0}},
                  el('button',{style:{display:'flex',alignItems:'center',gap:'3px',padding:'4px 8px',background:'var(--bd)',color:'var(--blue)',fontWeight:'700',fontSize:'10px',borderRadius:'6px'},
                    onClick:()=>{navigator.clipboard.writeText(link);toast('Link copied!');}},ic('copy',10),'Copy Link'),
                  el('button',{class:'btn br',style:{padding:'4px 8px',fontSize:'10px'},onClick:()=>revokeAdmin(a.key)},ic('x',10))
                )
              )
            );
          })
        )
      )
    )
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN — ANALYTICS
// ══════════════════════════════════════════
function renderAnalyticsS(){
  const topQ=getTopQ();
  const cities={};S.hotels.forEach(h=>{if(h.city)cities[h.city]=(cities[h.city]||0)+1;});
  const topCities=Object.entries(cities).sort((a,b)=>b[1]-a[1]).slice(0,8);
  return el('div',{class:'content fi'},
    el('div',{class:'g2',style:{gap:'14px',marginBottom:'14px'}},
      el('div',{class:'card',style:{padding:'14px'}},
        el('h3',{style:{fontSize:'13px',color:'var(--ink)',marginBottom:'10px'}},'Customer Search Trends'),
        topQ.length===0?el('p',{style:{fontSize:'12px',color:'var(--ink-f)',textAlign:'center',padding:'20px'}},'No search logs yet.\nIntegrate search logging in main website.'):
        el('div',{},topQ.slice(0,10).map((s,i)=>el('div',{style:{display:'flex',gap:'8px',padding:'6px 0',borderBottom:i<topQ.length-1?'1px solid var(--line)':'none'}},
          el('span',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',width:'14px'}},(i+1)+'.'),
          el('span',{style:{flex:1,fontSize:'12px',fontWeight:'600'}},s.q),
          el('span',{class:'b b-b'},s.c+'x')
        )))
      ),
      el('div',{class:'card',style:{padding:'14px'}},
        el('h3',{style:{fontSize:'13px',color:'var(--ink)',marginBottom:'10px'}},'Hotels by City'),
        topCities.length===0?el('p',{style:{fontSize:'12px',color:'var(--ink-f)',textAlign:'center',padding:'20px'}},'No data'):
        el('div',{},topCities.map(([c,n],i)=>el('div',{style:{display:'flex',gap:'8px',padding:'6px 0',borderBottom:i<topCities.length-1?'1px solid var(--line)':'none'}},
          el('span',{style:{flex:1,fontSize:'12px',fontWeight:'600'}},c),
          el('span',{class:'b b-b'},n+' hotels')
        )))
      )
    )
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN — BOOKINGS
// ══════════════════════════════════════════
function renderBookingsS(){
  return el('div',{class:'content fi'},
    el('div',{class:'g3',style:{marginBottom:'14px'}},
      mkStat(S.bookings.length,'Total','var(--ac)','book'),
      mkStat(S.bookings.filter(b=>b.status==='confirmed').length,'Confirmed','var(--good)','check'),
      mkStat(S.bookings.filter(b=>!b.status||b.status==='pending').length,'Pending','#F59E0B','bell')
    ),
    el('div',{class:'card',style:{overflow:'hidden'}},
      el('table',{class:'tbl'},
        el('thead',{},el('tr',{},['Guest','Hotel','Phone','Check-in','Rooms','Status'].map(h=>el('th',{},h)))),
        el('tbody',{},
          S.bookings.length===0?[el('tr',{},el('td',{colspan:'6',style:{textAlign:'center',color:'var(--ink-f)',padding:'36px'}},'No bookings yet'))]:
          S.bookings.slice().reverse().map(b=>el('tr',{},
            el('td',{style:{fontWeight:'600',fontSize:'12px'}},b.name||'—'),
            el('td',{style:{fontSize:'12px'}},b.hotelName||b.hotelId||'—'),
            el('td',{style:{fontSize:'12px'}},b.phone||'—'),
            el('td',{style:{fontSize:'12px'}},fmt(b.checkIn)),
            el('td',{style:{fontSize:'12px'}},b.rooms||'1'),
            el('td',{},el('span',{class:'b '+(b.status==='confirmed'?'b-g':b.status==='cancelled'?'b-r':'b-a')},b.status||'pending'))
          ))
        )
      )
    )
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN — WEBSITE SETTINGS
// ══════════════════════════════════════════
function renderWebsiteS(){
  const cfg=S.siteSettings;
  const row=(label,child)=>el('div',{style:{marginBottom:'14px'}},lbl(label),child);
  return el('div',{class:'content fi'},
    el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}},
      el('h2',{style:{fontSize:'17px',color:'var(--ink)'}},'Website Settings'),
      el('button',{class:'btn ba',disabled:S.settingsSaving,onClick:saveSiteSettings},S.settingsSaving?sp():ic('save',13),S.settingsSaving?'Saving...':'Save All Changes')
    ),

    // Hero Section
    el('div',{class:'sec-card'},
      el('h3',{style:{fontSize:'14px',color:'var(--ink)',marginBottom:'14px',display:'flex',alignItems:'center',gap:'6px'}},ic('paint',15),' Hero Section'),
      row('Hero Title (Main Heading)',el('input',{class:'inp',value:cfg.heroTitle,onInput:e=>{S.siteSettings.heroTitle=e.target.value;}})),
      row('Hero Subtitle',el('textarea',{class:'inp',rows:'2',onInput:e=>{S.siteSettings.heroSubtitle=e.target.value;}},cfg.heroSubtitle)),
      row('Hero Background Gradient (CSS)',el('input',{class:'inp',value:cfg.heroGradient,onInput:e=>{S.siteSettings.heroGradient=e.target.value;}})),
      el('div',{style:{height:'80px',borderRadius:'var(--r)',display:'flex',alignItems:'center',justifyContent:'center',background:cfg.heroGradient,color:'#fff',fontSize:'14px',fontWeight:'700',marginBottom:'14px'}},'Preview: '+cfg.heroTitle)
    ),

    // Branding
    el('div',{class:'sec-card'},
      el('h3',{style:{fontSize:'14px',color:'var(--ink)',marginBottom:'14px',display:'flex',alignItems:'center',gap:'6px'}},ic('paint',15),' Branding & Colors'),
      row('Site Name',el('input',{class:'inp',value:cfg.siteName,onInput:e=>{S.siteSettings.siteName=e.target.value;}})),
      el('div',{class:'g2',style:{marginBottom:'14px'}},
        el('div',{},lbl('Accent Color'),
          el('div',{style:{display:'flex',gap:'8px',alignItems:'center'}},
            el('input',{type:'color',value:cfg.accentColor,style:{width:'44px',height:'36px',borderRadius:'8px',border:'1px solid var(--line)',cursor:'pointer'},onInput:e=>{S.siteSettings.accentColor=e.target.value;}}),
            el('input',{class:'inp',value:cfg.accentColor,style:{flex:1},onInput:e=>{S.siteSettings.accentColor=e.target.value;}})
          )
        ),
        el('div',{},lbl('Footer Text'),el('input',{class:'inp',value:cfg.footerText,onInput:e=>{S.siteSettings.footerText=e.target.value;}}))
      )
    ),

    // Contact & Social
    el('div',{class:'sec-card'},
      el('h3',{style:{fontSize:'14px',color:'var(--ink)',marginBottom:'14px',display:'flex',alignItems:'center',gap:'6px'}},ic('bell',15),' Contact & Social'),
      el('div',{class:'g2'},
        el('div',{},row('WhatsApp Number',el('input',{class:'inp',placeholder:'+91 98765 43210',value:cfg.whatsapp,onInput:e=>{S.siteSettings.whatsapp=e.target.value;}}))),
        el('div',{},row('Contact Email',el('input',{class:'inp',placeholder:'hello@hotelradar.in',value:cfg.email,onInput:e=>{S.siteSettings.email=e.target.value;}}))),
        el('div',{},row('Phone Number',el('input',{class:'inp',placeholder:'+91 98765 43210',value:cfg.phone,onInput:e=>{S.siteSettings.phone=e.target.value;}}))),
      )
    ),

    // Announcement Banner
    el('div',{class:'sec-card'},
      el('h3',{style:{fontSize:'14px',color:'var(--ink)',marginBottom:'14px',display:'flex',alignItems:'center',gap:'6px'}},ic('bell',15),' Announcement Banner'),
      el('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}},
        el('div',{class:'tog'+(cfg.showBanner?' on':''),onClick:()=>ss({showBanner:!cfg.showBanner})}),
        el('span',{style:{fontSize:'13px',fontWeight:'600',color:'var(--ink)'}},'Show Banner on Website')
      ),
      cfg.showBanner?row('Banner Text',el('input',{class:'inp',value:cfg.bannerText,placeholder:'🎉 Announcement text...',onInput:e=>{S.siteSettings.bannerText=e.target.value;}})):null
    ),

    // Maintenance Mode
    el('div',{class:'sec-card',style:{border:'1px solid #FECACA'}},
      el('h3',{style:{fontSize:'14px',color:'#DC2626',marginBottom:'14px',display:'flex',alignItems:'center',gap:'6px'}},ic('warn',15),' Maintenance Mode'),
      el('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between'}},
        el('div',{},
          el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)'}},'Put Website in Maintenance'),
          el('p',{style:{fontSize:'11px',color:'var(--ink-s)',marginTop:'2px'}},'Website visitors will see maintenance page')
        ),
        el('div',{class:'tog'+(cfg.maintenanceMode?' on':''),style:{background:cfg.maintenanceMode?'#EF4444':'var(--line)'},onClick:()=>ss({maintenanceMode:!cfg.maintenanceMode})})
      )
    ),

    // Save button at bottom
    el('button',{class:'btn ba btn-w',style:{marginTop:'8px'},disabled:S.settingsSaving,onClick:saveSiteSettings},S.settingsSaving?sp():ic('save',13),S.settingsSaving?'Saving...':'Save All Changes')
  );
}


// ══════════════════════════════════════════
// SUPER ADMIN — HOTEL REQUESTS
// ══════════════════════════════════════════
function renderRequestsS(){
  const reqs=S.hotelRequests;
  const pending=reqs.filter(r=>r.status==='pending');
  const approved=reqs.filter(r=>r.status==='approved');

  async function approveReq(req){
    // 1. Update status
    await db.ref(`hotelRequests/${req.id}`).update({status:'approved',approvedAt:new Date().toISOString()});
    // 2. Create sharedAdmin entry so they can login
    const key=req.email.replace(/\./g,'_');
    await db.ref(`sharedAdmins/${key}`).set({
      email:req.email,
      hotelName:req.hotelName,
      ownerName:req.ownerName,
      phone:req.phone,
      addedAt:new Date().toISOString(),
      addedBy:'superadmin',
      active:true,
      plan:'free',
      planExpiry:new Date(Date.now()+30*864e5).toISOString(),
    });
    // 3. Generate their panel link
    const link=`${location.origin}${location.pathname}?admin=${encodeURIComponent(req.email)}`;
    set({approvedLink:link,approvedReq:req});
    toast('Hotel approved! Share the panel link with owner.');
  }

  async function rejectReq(id){
    await db.ref(`hotelRequests/${id}`).update({status:'rejected',rejectedAt:new Date().toISOString()});
    toast('Request rejected.');
  }

  return el('div',{class:'content fi'},
    el('div',{class:'g3',style:{marginBottom:'16px'}},
      mkStat(reqs.length,'Total Requests','var(--ac)','bell'),
      mkStat(pending.length,'Pending Review','#F59E0B','warn'),
      mkStat(approved.length,'Approved','var(--good)','check')
    ),

    // Approved link modal
    S.approvedLink&&el('div',{style:{marginBottom:'16px',padding:'16px',background:'var(--gd)',border:'1px solid #86EFAC',borderRadius:'var(--r2)'}},
      el('p',{style:{fontSize:'12px',fontWeight:'700',color:'var(--good)',marginBottom:'4px'}},'✅ '+S.approvedReq?.hotelName+' approved!'),
      el('p',{style:{fontSize:'11px',color:'var(--good)',marginBottom:'8px'}},'Share this Hotel Admin Panel link with owner ('+S.approvedReq?.email+'):'),
      el('div',{class:'lbx',style:{marginBottom:'8px'}},
        el('span',{style:{flex:1,fontSize:'11px',wordBreak:'break-all'}},S.approvedLink),
        el('button',{style:{flexShrink:0,display:'flex',alignItems:'center',gap:'3px',padding:'5px 9px',background:'var(--ac)',color:'#fff',fontWeight:'700',fontSize:'11px',borderRadius:'6px'},
          onClick:()=>{navigator.clipboard.writeText(S.approvedLink);toast('Link copied!');}},ic('copy',11),'Copy')
      ),
      el('a',{href:'https://wa.me/'+S.approvedReq?.phone?.replace(/\D/g,'')+'?text='+encodeURIComponent('Congratulations '+S.approvedReq?.ownerName+'! Your hotel '+S.approvedReq?.hotelName+' has been approved on HotelRadar. Here is your Hotel Admin Panel link to setup your listing: '+S.approvedLink+' Login with your Gmail ('+S.approvedReq?.email+') to get started. First 30 days are FREE!'),
        target:'_blank',
        style:{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',padding:'9px',background:'#25D366',color:'#fff',fontWeight:'700',fontSize:'12px',borderRadius:'8px',textDecoration:'none',marginBottom:'6px'}},
        '💬 Send via WhatsApp to '+S.approvedReq?.phone),
      el('button',{style:{fontSize:'11px',color:'var(--ink-s)',cursor:'pointer',textDecoration:'underline'},onClick:()=>set({approvedLink:'',approvedReq:null})},'Dismiss')
    ),

    // Pending requests
    pending.length>0&&el('div',{class:'card',style:{overflow:'hidden',marginBottom:'14px'}},
      el('div',{style:{padding:'12px 16px',borderBottom:'1px solid var(--line)',background:'#FEF3C7'}},
        el('h3',{style:{fontSize:'13px',color:'#92400E',display:'flex',alignItems:'center',gap:'6px'}},ic('warn',14),'Pending Approval ('+pending.length+')')
      ),
      el('div',{style:{display:'flex',flexDirection:'column'}},
        ...pending.map((req,i)=>
          el('div',{style:{padding:'14px 16px',borderBottom:i<pending.length-1?'1px solid var(--line)':'none'}},
            el('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'10px',marginBottom:'10px'}},
              el('div',{},
                el('p',{style:{fontSize:'13px',fontWeight:'700',color:'var(--ink)'}} ,req.hotelName),
                el('p',{style:{fontSize:'11px',color:'var(--ink-s)',marginTop:'2px'}},req.ownerName+' · '+req.city+', '+req.state),
                el('p',{style:{fontSize:'11px',color:'var(--ink-s)'}},'📞 '+req.phone+' · 📧 '+req.email),
                req.website&&el('p',{style:{fontSize:'11px',color:'var(--blue)'}},'🌐 '+req.website),
                el('p',{style:{fontSize:'11px',color:'var(--ink-s)',marginTop:'2px'}},'Type: '+req.type+' · Price: '+(req.priceRange||'—')),
                req.message&&el('p',{style:{fontSize:'11px',color:'var(--ink-s)',fontStyle:'italic',marginTop:'2px'}},'📝 '+req.message),
                req.hasDocs?.length>0&&el('div',{style:{marginTop:'6px',display:'flex',flexWrap:'wrap',gap:'4px'}},
                  el('span',{style:{fontSize:'9px',fontWeight:'700',color:'var(--ink-f)'}},'Docs: '),
                  ...req.hasDocs.map(d=>el('span',{class:'b b-g',style:{fontSize:'9px'}},d))
                ),
                el('p',{style:{fontSize:'10px',color:'var(--ink-f)',marginTop:'4px'}},'Submitted: '+fmtT(req.submittedAt))
              )
            ),
            el('div',{style:{display:'flex',gap:'8px'}},
              el('button',{class:'btn bg',style:{flex:1,justifyContent:'center'},onClick:()=>approveReq(req)},ic('check',13),'Approve & Send Panel Link'),
              el('button',{class:'btn br',style:{padding:'9px 14px'},onClick:()=>rejectReq(req.id)},ic('x',13),'Reject')
            )
          )
        )
      )
    ),

    // Approved requests
    approved.length>0&&el('div',{class:'card',style:{overflow:'hidden'}},
      el('div',{style:{padding:'12px 16px',borderBottom:'1px solid var(--line)'}},
        el('h3',{style:{fontSize:'13px',color:'var(--ink)'}},'Approved Hotels ('+approved.length+')')
      ),
      el('table',{class:'tbl'},
        el('thead',{},el('tr',{},...['Hotel','Owner','Email','City','Approved','Actions'].map(h=>el('th',{},h)))),
        el('tbody',{},
          ...approved.map(req=>{
            const link=`${location.origin}${location.pathname}?admin=${encodeURIComponent(req.email)}`;
            return el('tr',{},
              el('td',{style:{fontWeight:'700',fontSize:'12px'}},req.hotelName),
              el('td',{style:{fontSize:'12px'}},req.ownerName),
              el('td',{style:{fontSize:'12px'}},req.email),
              el('td',{style:{fontSize:'12px'}},req.city),
              el('td',{style:{fontSize:'11px',color:'var(--ink-s)'}},fmt(req.approvedAt)),
              el('td',{},
                el('button',{style:{display:'flex',alignItems:'center',gap:'3px',padding:'4px 8px',background:'var(--bd)',color:'var(--blue)',fontWeight:'700',fontSize:'10px',borderRadius:'6px'},
                  onClick:()=>{navigator.clipboard.writeText(link);toast('Link copied!');}},ic('copy',10),'Copy Link')
              )
            );
          })
        )
      )
    ),

    reqs.length===0&&el('div',{class:'card',style:{padding:'48px',textAlign:'center'}},
      el('p',{style:{fontSize:'32px',marginBottom:'10px'}},'📋'),
      el('p',{style:{fontSize:'14px',fontWeight:'700',color:'var(--ink)',marginBottom:'6px'}},'No Requests Yet'),
      el('p',{style:{fontSize:'12px',color:'var(--ink-s)'}},'Hotel listing requests from website will appear here.')
    )
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN — ACTIVITY
// ══════════════════════════════════════════
function renderActivityS(){
  const logs=[
    ...S.payments.map(p=>({t:p.date,msg:'Payment ₹'+p.amount+' from '+p.adminEmail,c:'var(--good)'})),
    ...S.sharedAdmins.map(a=>({t:a.addedAt,msg:'Access shared to '+a.email,c:'var(--blue)'})),
    ...S.hotels.map(h=>({t:h.createdAt,msg:'Hotel added: '+h.name+' ('+h.city+')',c:'var(--ac)'})),
    ...S.bookings.map(b=>({t:b.createdAt,msg:'Booking: '+(b.name||'Guest')+' → '+(b.hotelName||b.hotelId||'hotel'),c:'var(--pur)'})),
  ].sort((a,b)=>new Date(b.t||0)-new Date(a.t||0));
  return el('div',{class:'content fi'},
    el('div',{class:'card',style:{padding:'16px'}},
      el('h3',{style:{fontSize:'13px',color:'var(--ink)',marginBottom:'12px'}},'Activity Log ('+logs.length+' events)'),
      logs.length===0?el('p',{style:{textAlign:'center',color:'var(--ink-f)',padding:'32px',fontSize:'12px'}},'No activity yet'):
      el('div',{},logs.slice(0,60).map((l,i)=>
        el('div',{style:{display:'flex',gap:'10px',padding:'8px 0',borderBottom:i<logs.length-1?'1px solid var(--line)':'none'}},
          el('div',{style:{width:'7px',height:'7px',borderRadius:'50%',background:l.c,marginTop:'5px',flexShrink:0}}),
          el('div',{style:{flex:1}},
            el('p',{style:{fontSize:'12px',fontWeight:'600',color:'var(--ink)'}},l.msg),
            el('p',{style:{fontSize:'10px',color:'var(--ink-f)',marginTop:'1px'}},fmtT(l.t))
          )
        )
      ))
    )
  );
}

// ══════════════════════════════════════════
// HOTEL ADMIN TABS
// ══════════════════════════════════════════
