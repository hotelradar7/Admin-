// ============================================================
// admin-shell.js — HotelRadar Admin Panel
// Login page, sidebar, mobile nav, topbar
// Depends on: config.js, admin-core.js
// ============================================================

function renderLogin(){
  const isH=IS_HOTEL;
  return el('div',{style:{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:isH?'var(--paper)':'linear-gradient(135deg,#1a1916,#353330)',padding:'20px'}},
    el('div',{style:{width:'100%',maxWidth:'380px',background:'var(--card)',borderRadius:'20px',padding:'28px',boxShadow:'var(--s3)',border:'1px solid var(--line)'},class:'fi'},
      el('div',{style:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'22px',justifyContent:'center'}},
        el('div',{style:{width:'46px',height:'46px',borderRadius:'13px',background:'linear-gradient(135deg,#E8631C,#F2A65A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'900',fontSize:'21px',fontFamily:'Fraunces,serif'}},'H'),
        el('div',{},el('h1',{style:{fontSize:'18px',color:'var(--ink)'}},isH?'Hotel Admin':'Super Admin'),el('p',{style:{fontSize:'11px',color:'var(--ink-f)'}},isH?'Powered by HotelRadar':'HotelRadar Control Panel'))
      ),
      isH?el('div',{style:{padding:'10px 13px',background:'var(--acd)',border:'1px solid rgba(232,99,28,.2)',borderRadius:'var(--r)',marginBottom:'16px'}},
        el('p',{style:{fontSize:'11.5px',color:'var(--aci)',lineHeight:'1.6',fontWeight:'600'}},'👋 This panel is for:\n'+decodeURIComponent(HOTEL_EMAIL)+'\nSign in with that Google account.')
      ):null,
      S.lErr?el('div',{style:{display:'flex',alignItems:'center',gap:'7px',padding:'9px 12px',background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'8px',marginBottom:'13px',fontSize:'12px',color:'#DC2626'}},ic('warn',13),S.lErr):null,
      // Google btn
      el('button',{
        onClick:doGoogle,disabled:S.gLoad,
        style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',padding:'12px',background:'var(--card)',border:'2px solid var(--line)',borderRadius:'var(--r)',fontSize:'13px',fontWeight:'700',color:'var(--ink)',marginBottom:'13px',cursor:'pointer',transition:'all .15s',boxShadow:'var(--s1)'},
        onMouseenter:e=>e.currentTarget.style.borderColor='var(--ac)',
        onMouseleave:e=>e.currentTarget.style.borderColor='var(--line)',
      },
        S.gLoad?sp(18,'#ccc','#555'):el('svg',{width:'20',height:'20',viewBox:'0 0 48 48'},
          el('path',{fill:'#EA4335',d:'M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'}),
          el('path',{fill:'#4285F4',d:'M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'}),
          el('path',{fill:'#FBBC05',d:'M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'}),
          el('path',{fill:'#34A853',d:'M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'})
        ),
        S.gLoad?'Signing in...':'Continue with Google'
      ),
      el('div',{style:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'13px'}},
        el('div',{style:{flex:1,height:'1px',background:'var(--line)'}}),
        el('span',{style:{fontSize:'10px',fontWeight:'700',color:'var(--ink-f)',textTransform:'uppercase'}},'or email'),
        el('div',{style:{flex:1,height:'1px',background:'var(--line)'}})
      ),
      el('div',{style:{display:'flex',flexDirection:'column',gap:'9px'}},
        el('input',{class:'inp',type:'email',placeholder:'Email address',value:S.lEmail,onInput:e=>setInput({lEmail:e.target.value}),onKeydown:e=>e.key==='Enter'&&doLogin()}),
        el('div',{style:{position:'relative'}},
          el('input',{class:'inp',type:S.lShowPass?'text':'password',placeholder:'Password',style:{paddingRight:'40px'},value:S.lPass,onInput:e=>setInput({lPass:e.target.value}),onKeydown:e=>e.key==='Enter'&&doLogin()}),
          el('button',{onClick:()=>{S.lShowPass=!S.lShowPass;render();},style:{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--ink-f)'}},ic(S.lShowPass?'eyeoff':'eye',14))
        ),
        el('button',{class:'btn ba btn-w',disabled:S.lLoading,onClick:doLogin},S.lLoading?sp():null,S.lLoading?'Signing in...':'Sign In')
      )
    )
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN NAV DATA
// ══════════════════════════════════════════
const SUPER_NAVS=[
  {id:'dashboard',l:'Dashboard',i:'dash'},
  {id:'hotels',l:'All Hotels',i:'hotel'},
  {id:'payments',l:'Payments',i:'money'},
  {id:'admins',l:'Hotel Admins',i:'users'},
  {id:'share',l:'Share Access',i:'share'},
  {id:'analytics',l:'Analytics',i:'bar'},
  {id:'bookings',l:'Bookings',i:'book'},
  {id:'website',l:'Website Settings',i:'globe'},
  {id:'requests',l:'Hotel Requests',i:'bell'},
  {id:'activity',l:'Activity Log',i:'act'},
];

// ══════════════════════════════════════════
// SIDEBAR (desktop only)
// ══════════════════════════════════════════
function renderSidebar(){
  const navs=IS_HOTEL?[]:SUPER_NAVS;
  return el('div',{class:'sidebar'},
    el('div',{style:{padding:'14px 14px 8px',borderBottom:'1px solid var(--line)',marginBottom:'6px'}},
      el('div',{style:{display:'flex',alignItems:'center',gap:'9px'}},
        el('div',{style:{width:'34px',height:'34px',borderRadius:'9px',background:'linear-gradient(135deg,#E8631C,#F2A65A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'900',fontSize:'16px',fontFamily:'Fraunces,serif'}},'H'),
        el('div',{},
          el('p',{style:{fontSize:'12px',fontWeight:'700',fontFamily:'Fraunces,serif',color:'var(--ink)'}},'HotelRadar'),
          el('p',{style:{fontSize:'9px',fontWeight:'700',color:'var(--ac)',textTransform:'uppercase',letterSpacing:'.05em'}},'Super Admin')
        )
      )
    ),
    el('div',{style:{flex:1,padding:'4px 0'}},
      ...navs.map(n=>{
        const bdg=n.id==='hotels'?S.hotels.filter(h=>!h.approved).length:0;
        return el('div',{class:'ni'+(S.tab===n.id?' on':''),onClick:()=>set({tab:n.id})},
          el('span',{},ic(n.i,14)),n.l,
          bdg>0?el('span',{class:'bdg'},bdg):null
        );
      })
    ),
    el('div',{style:{padding:'10px 8px',borderTop:'1px solid var(--line)'}},
      el('div',{class:'ni',onClick:doSignOut},ic('logout',14),'Sign Out'))
  );
}

// ══════════════════════════════════════════
// MOBILE BOTTOM NAV
// ══════════════════════════════════════════
function renderMobNav(){
  const navs=IS_HOTEL?[
    {id:'dashboard',l:'Home',i:'dash'},
    {id:'hotel',l:'Hotel',i:'hotel'},
    {id:'bookings',l:'Bookings',i:'book'},
    {id:'reviews',l:'Reviews',i:'star'},
    {id:'plan',l:'Plan',i:'plan'},
    {id:'settings',l:'Settings',i:'settings'},
  ]:SUPER_NAVS;

  return el('div',{class:'mob-nav'},
    el('div',{class:'mob-nav-inner'},
      ...navs.map(n=>
        el('div',{class:'mni'+(S.tab===n.id?' on':''),onClick:()=>set({tab:n.id})},
          ic(n.i,18),
          el('span',{},n.l)
        )
      ),
      // Sign out at end
      el('div',{class:'mni',onClick:doSignOut},ic('logout',18),el('span',{},'Logout'))
    )
  );
}

// ══════════════════════════════════════════
// MOBILE TOP BAR
// ══════════════════════════════════════════
function renderMobTop(){
  const titles=IS_HOTEL?{dashboard:'Dashboard',hotel:'My Hotel',bookings:'Bookings',reviews:'Reviews',plan:'My Plan',settings:'Settings'}:{dashboard:'Dashboard',hotels:'Hotels',payments:'Payments',admins:'Hotel Admins',share:'Share Access',analytics:'Analytics',bookings:'Bookings',website:'Website Settings',activity:'Activity Log'};
  return el('div',{class:'mob-top'},
    el('div',{style:{display:'flex',alignItems:'center',gap:'10px'}},
      el('div',{style:{width:'30px',height:'30px',borderRadius:'8px',background:'linear-gradient(135deg,#E8631C,#F2A65A)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'900',fontSize:'14px',fontFamily:'Fraunces,serif'}},'H'),
      el('h2',{style:{fontSize:'15px',fontFamily:'Fraunces,serif',color:'var(--ink)'}},titles[S.tab]||'Admin')
    ),
    el('div',{style:{width:'30px',height:'30px',borderRadius:'50%',background:'var(--ac)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:'700'}},(S.user?.email||'A')[0].toUpperCase())
  );
}

// ══════════════════════════════════════════
// DESKTOP TOPBAR
// ══════════════════════════════════════════
function renderTopbar(){
  const titles={dashboard:'Dashboard',hotels:'All Hotels',payments:'Payments & Plans',admins:'Hotel Admins',share:'Share Admin Access',analytics:'Analytics',bookings:'All Bookings',website:'Website Settings',activity:'Activity Log'};
  return el('div',{class:'topbar'},
    el('h2',{style:{fontSize:'16px',fontFamily:'Fraunces,serif',color:'var(--ink)'}},titles[S.tab]||''),
    el('div',{style:{display:'flex',gap:'8px',alignItems:'center'}},
      el('div',{style:{width:'30px',height:'30px',borderRadius:'50%',background:'var(--ac)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'12px',fontWeight:'700'}},(S.user?.email||'A')[0].toUpperCase()),
      el('button',{style:{color:'var(--ink-s)',display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',fontWeight:'600'},onClick:doSignOut},ic('logout',13),'Sign Out')
    )
  );
}

// ══════════════════════════════════════════
// SUPER ADMIN — DASHBOARD
// ══════════════════════════════════════════
