// ================================================================
// admin-core.js — HotelRadar Admin Panel
// State management, Firebase init, data load/save,
// image upload, helper functions (el, ic, toast, set)
// Depends on: config.js (pehle load hona chahiye)
// ================================================================

// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════
// config.js se load hota hai
const FB = FIREBASE_CONFIG;
const AMENITIES=["AC","WiFi","Restaurant","Parking","Pool","Gym","Spa","Ganga View","Mountain View","Room Service","Laundry","Couple Friendly","Family Friendly","Hot Water","TV","Mini Bar","Balcony","Garden","Airport Shuttle","24/7 Reception"];
const URL_P=new URLSearchParams(location.search);
const HOTEL_EMAIL=URL_P.get('admin');
const IS_HOTEL=!!HOTEL_EMAIL;

// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
let S={
  authReady:false,isAuth:false,user:null,
  tab:'dashboard',
  // super data
  hotels:[],sharedAdmins:[],payments:[],bookings:[],searchLogs:[],hotelRequests:[],
  // hotel admin data
  myAdmin:null,myHotel:null,myBookings:[],myReviews:[],
  loading:true,
  selectedRoom:null,
  showWelcome:false,
  showRoomEditor:false,
  editingRooms:[],
  roomFeatureInput:'',
  // gallery state
  imgUploading:false,imgUploadProg:0,imgUploadErr:'',
  roomEditorFocus:null,
  hfStep:1,
  // forms
  showHotelForm:false,editHotel:null,
  hf:eH(),hfErr:'',hfSaving:false,amenityInput:'',
  showShare:false,shareEmail:'',shareErr:'',shareSaving:false,genLink:'',
  showPayment:false,payOpt:'monthly',
  delId:null,delType:'',
  approvedLink:'',approvedReq:null,
  // website settings
  siteSettings:{
    heroTitle:'Find Your Perfect Stay',
    heroSubtitle:'India\'s trusted hotel directory — verified hotels, direct contact, zero commission.',
    heroGradient:'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accentColor:'#E8631C',
    siteName:'HotelRadar',
    whatsapp:'',
    email:'',
    phone:'',
    footerText:'Made with ❤️ in India',
    showBanner:true,
    bannerText:'🎉 New hotels added in Haridwar & Rishikesh!',
    maintenanceMode:false,
  },
  settingsSaving:false,
  // login
  lEmail:'',lPass:'',lErr:'',lLoading:false,lShowPass:false,gLoad:false,
  toast:null,
  hotelSearch:'',hotelFilter:'all',
};
function eH(){return{name:'',city:'',state:'',area:'',pin:'',phone:'',type:'hotel',price:'',rating:'4.5',reviewCount:'0',checkIn:'12:00 PM',checkOut:'11:00 AM',plan:'basic',emoji:'🏨',gradient:'linear-gradient(135deg,#E8631C,#F2A65A)',desc:'',amenities:[],badges:[],images:[],imageUrl:'',approved:false,active:true};}
// Input-only keys that should NOT trigger full re-render
const INPUT_KEYS=['lEmail','lPass','lShowPass','shareEmail','hotelSearch','amenityInput','imgUploadProg'];
function set(p,skipRender){
  S={...S,...p};
  if(skipRender)return;
  const keys=Object.keys(p);
  const onlyInputKeys=keys.every(k=>INPUT_KEYS.includes(k));
  if(!onlyInputKeys)render();
}
function setInput(p){S={...S,...p};} // update state only, no render
function sh(p){set({hf:{...S.hf,...p}});}
function ss(p){set({siteSettings:{...S.siteSettings,...p}});}

// ══════════════════════════════════════════
// FIREBASE
// ══════════════════════════════════════════
let db=null;
// Prevent multiple auth checks
let _authChecked=false;

function initFB(){
  if(!firebase.apps.length)firebase.initializeApp(FB);
  db=firebase.database();
  // Keep user logged in across page refreshes
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
  firebase.auth().onAuthStateChanged(async u=>{
    // If already authenticated and same user, ignore re-fires
    if(S.isAuth && u && S.user?.email===u.email) return;

    if(!u){
      // Only show logged out if we were previously auth
      if(_authChecked){
        set({authReady:true,isAuth:false,user:null,myAdmin:null,myHotel:null});
      } else {
        set({authReady:true,isAuth:false});
      }
      _authChecked=true;
      return;
    }

    _authChecked=true;

    if(IS_HOTEL){
      const email=u.email,exp=decodeURIComponent(HOTEL_EMAIL);
      if(email.toLowerCase()!==exp.toLowerCase()){
        set({authReady:true,isAuth:false,lErr:`This panel is for: ${exp}`});
        return;
      }
      try{
        const key=email.replace(/\./g,'_');
        const snap=await db.ref(`sharedAdmins/${key}`).get();
        if(!snap.exists()){
          set({authReady:true,isAuth:false,lErr:'Access not granted. Contact HotelRadar admin.'});
          return;
        }
        const ad=snap.val();
        // Check if active
        if(ad.active===false){
          set({authReady:true,isAuth:false,lErr:'Your access has been deactivated. Contact HotelRadar.'});
          return;
        }
        set({authReady:true,isAuth:true,user:u,myAdmin:{...ad,key},showWelcome:true,gLoad:false,lLoading:false,lErr:''});
        setTimeout(()=>set({showWelcome:false}),3200);
        loadHotelData(email,key,ad);
      } catch(e){
        set({authReady:true,isAuth:false,lErr:'Error checking access. Try again.'});
      }
    } else {
      if(u.email!==SUPER_EMAIL){
        set({authReady:true,isAuth:false,lErr:'Access denied. Only Super Admin can login here.'});
        return;
      }
      set({authReady:true,isAuth:true,user:u,gLoad:false,lLoading:false,lErr:''});
      loadSuperData();
    }
  });
}

function loadSuperData(){
  db.ref('hotels').on('value',s=>{
    const d=s.val();if(!d){set({hotels:[],loading:false});return;}
    const l=Array.isArray(d)?d.filter(Boolean):Object.keys(d).map(k=>({...d[k],id:d[k].id||k}));
    set({hotels:l,loading:false});
  });
  db.ref('sharedAdmins').on('value',s=>{const d=s.val();if(!d){set({sharedAdmins:[]});return;}set({sharedAdmins:Object.keys(d).map(k=>({...d[k],key:k}))});});
  db.ref('payments').on('value',s=>{const d=s.val();if(!d){set({payments:[]});return;}set({payments:Object.keys(d).map(k=>({...d[k],id:k}))});});
  db.ref('bookings').on('value',s=>{const d=s.val();if(!d){set({bookings:[]});return;}set({bookings:Object.keys(d).map(k=>({...d[k],id:k}))});});
  db.ref('hotelRequests').on('value',s=>{const d=s.val();if(!d){set({hotelRequests:[]});return;}set({hotelRequests:Object.keys(d).map(k=>({...d[k],id:k})).sort((a,b)=>new Date(b.submittedAt||0)-new Date(a.submittedAt||0))});});
  db.ref('searchLogs').limitToLast(300).on('value',s=>{const d=s.val();if(!d){set({searchLogs:[]});return;}set({searchLogs:Object.keys(d).map(k=>({...d[k],id:k})).reverse()});});
  db.ref('siteSettings').get().then(s=>{if(s.exists())set({siteSettings:{...S.siteSettings,...s.val()}});});
}

function loadHotelData(email,key,ad){
  db.ref('hotels').on('value',s=>{
    const d=s.val();if(!d){set({myHotel:null,loading:false});return;}
    const all=Array.isArray(d)?d.filter(Boolean):Object.keys(d).map(k=>({...d[k],id:d[k].id||k}));
    const mine=all.find(h=>h.ownerEmail===email||h.id===ad.hotelId)||null;
    set({myHotel:mine,loading:false,hf:mine?{...mine,price:String(mine.price||''),rating:String(mine.rating||'4.5'),reviewCount:String(mine.reviewCount||0),images:mine.images||[]}:eH()});
  });
  db.ref('bookings').on('value',s=>{
    const d=s.val();if(!d){set({myBookings:[]});return;}
    const all=Object.keys(d).map(k=>({...d[k],id:k}));
    set({myBookings:all.filter(b=>b.hotelId===ad.hotelId||b.ownerEmail===email)});
  });
  db.ref(`reviews/${ad.hotelId||key}`).on('value',s=>{
    const d=s.val();if(!d){set({myReviews:[]});return;}
    set({myReviews:Object.keys(d).map(k=>({...d[k],id:k})).sort((a,b)=>new Date(b.date||0)-new Date(a.date||0))});
  });
}

async function doLogin(){
  if(S.lLoading)return;
  set({lLoading:true,lErr:''});
  try{
    await firebase.auth().signInWithEmailAndPassword(S.lEmail,S.lPass);
    // onAuthStateChanged handles rest — don't set anything here
  } catch(e){
    const c=e.code||'';
    const msg=c==='auth/wrong-password'||c==='auth/user-not-found'||c==='auth/invalid-credential'?'Invalid email or password.':
              c==='auth/too-many-requests'?'Too many attempts. Wait a few minutes or reset password.':
              c==='auth/network-request-failed'?'Network error. Check your internet.':
              e.message||'Login failed.';
    set({lLoading:false,lErr:msg});
  }
}
async function doGoogle(){
  set({gLoad:true,lErr:''});
  try{
    const p=new firebase.auth.GoogleAuthProvider();
    p.setCustomParameters({prompt:'select_account'});
    await firebase.auth().signInWithPopup(p);
    // onAuthStateChanged will handle the rest
  } catch(e){
    const msg=e.code==='auth/popup-closed-by-user'?'Popup was closed. Try again.':
              e.code==='auth/popup-blocked'?'Popup blocked. Allow popups and try again.':
              'Google sign-in failed. Try again.';
    set({gLoad:false,lErr:msg});
  }
}
async function doSignOut(){
  try{
    _authChecked=false;
    await firebase.auth().signOut();
  } catch(e){}
  set({isAuth:false,user:null,tab:'dashboard',myAdmin:null,myHotel:null,myBookings:[],myReviews:[],hotels:[],sharedAdmins:[],payments:[],bookings:[],lErr:''});
}

// Hotel ops
async function saveHotel(){
  if(!S.hf.name?.trim()){set({hfErr:'Hotel name required'});return;}
  if(!S.hf.city?.trim()){set({hfErr:'City required'});return;}
  if(!S.hf.phone?.trim()){set({hfErr:'Phone required'});return;}
  if(!S.hf.price||Number(S.hf.price)<=0){set({hfErr:'Valid price required'});return;}
  set({hfSaving:true,hfErr:''});
  try{
    const existId=S.editHotel?.id||(IS_HOTEL?S.myAdmin?.hotelId:null);
    const id=existId||('h'+Date.now());
    // Build images array: merge gallery uploads + legacy imageUrl
  const imgArr = S.hf.images && S.hf.images.length > 0 ? S.hf.images : (S.hf.imageUrl ? [{url:S.hf.imageUrl,primary:true}] : []);
  const h={...S.hf,id,price:Number(S.hf.price)||0,rating:Number(S.hf.rating)||4.5,reviewCount:Number(S.hf.reviewCount)||0,images:imgArr,imageUrl:imgArr.find(i=>i.primary)?.url||S.hf.imageUrl||'',createdAt:existId?(S.editHotel?.createdAt||new Date().toISOString()):new Date().toISOString()};
    if(IS_HOTEL){
      h.ownerEmail=S.user.email;
      h.approved=false; // needs super admin approval
      h.active=true;
      await db.ref(`sharedAdmins/${S.myAdmin.key}`).update({hotelId:id});
    }
    if(existId){
      await db.ref(`hotels/${id}`).update(h);
    } else {
      await db.ref(`hotels/${id}`).set(h);
    }
    toast(existId?'Hotel updated!':'Hotel added!');
    set({showHotelForm:false,editHotel:null,hfSaving:false});
  }catch(e){set({hfErr:e.message||'Save failed',hfSaving:false});}
}
async function delHotel(id){await db.ref(`hotels/${id}`).remove();set({delId:null});toast('Hotel deleted.');}
async function togF(id,f,v){await db.ref(`hotels/${id}`).update({[f]:v});}
async function shareAdmin(){
  const email=S.shareEmail.trim().toLowerCase();
  if(!email.includes('@')){set({shareErr:'Enter valid Gmail.'});return;}
  if(S.sharedAdmins.find(a=>a.email===email)){set({shareErr:'Already has access.'});return;}
  set({shareSaving:true,shareErr:''});
  try{
    const key=email.replace(/\./g,'_');
    await db.ref(`sharedAdmins/${key}`).set({email,addedAt:new Date().toISOString(),addedBy:S.user.email,active:true,plan:'free',planExpiry:new Date(Date.now()+30*864e5).toISOString()});
    const link=`${location.origin}${location.pathname}?admin=${encodeURIComponent(email)}`;
    set({shareSaving:false,shareEmail:'',genLink:link});
    toast('Access shared! Link generated.');
  }catch(e){set({shareSaving:false,shareErr:e.message||'Failed.'});}
}
async function revokeAdmin(key){await db.ref(`sharedAdmins/${key}`).remove();toast('Access revoked.');}

// ── IMAGE UPLOAD via Firebase Storage ──
async function uploadImageFile(file){
  if(!file) return null;
  if(!file.type.startsWith('image/')){
    toast('Sirf image files allowed (JPG/PNG/WEBP).','err');
    return null;
  }
  if(file.size > 5 * 1024 * 1024){
    toast('Image 5MB se choti honi chahiye.','err');
    return null;
  }
  let storage;
  try { storage = firebase.storage(); } catch(e){
    toast('Firebase Storage unavailable: '+e.message,'err');
    return null;
  }
  const hotelId=(S.myHotel&&S.myHotel.id)||(S.editHotel&&S.editHotel.id)||(S.myAdmin&&S.myAdmin.hotelId)||(S.hf&&S.hf.id)||('hotel_'+Date.now());
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
  const fileName=Date.now()+'_'+Math.random().toString(36).substr(2,8)+'.'+ext;
  const storagePath='hotelImages/'+hotelId+'/'+fileName;
  set({imgUploading:true,imgUploadProg:0,imgUploadErr:''});
  return new Promise(function(resolve){
    var storageRef=storage.ref(storagePath);
    var uploadTask=storageRef.put(file,{contentType:file.type});
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      function(snap){
        var pct=Math.round((snap.bytesTransferred/snap.totalBytes)*100);
        S.imgUploadProg=pct;
        var bar=document.getElementById('hr-img-prog-bar');
        if(bar)bar.style.width=pct+'%';
        var pctEl=document.getElementById('hr-img-prog-pct');
        if(pctEl)pctEl.textContent=pct+'%';
      },
      function(error){
        set({imgUploading:false,imgUploadErr:error.message||'Upload failed'});
        if(error.code==='storage/unauthorized') toast('Storage permission denied — Firebase Storage Rules check karo.','err');
        else if(error.code==='storage/unknown') toast('Network error — internet check karo.','err');
        else toast('Upload failed: '+(error.message||''),'err');
        resolve(null);
      },
      function(){
        uploadTask.snapshot.ref.getDownloadURL().then(function(url){
          set({imgUploading:false,imgUploadProg:100});
          resolve(url);
        }).catch(function(e){
          set({imgUploading:false,imgUploadErr:e.message});
          toast('Image URL nahi mili: '+e.message,'err');
          resolve(null);
        });
      }
    );
  });
}

async function handleImageFiles(files){
  const existing = (S.hf.images || []).length;
  const slots = Math.max(0, 20 - existing);
  if(slots === 0){ toast('Maximum 20 photos already added.','err'); return; }
  const arr = Array.from(files).slice(0, slots);
  let uploaded = 0;
  for(const file of arr){
    toast('Uploading '+(uploaded+1)+' of '+arr.length+'...','');
    const url = await uploadImageFile(file);
    if(url){
      if(!S.hf.images) S.hf.images = [];
      const isPrimary = S.hf.images.length === 0;
      S.hf.images = [...S.hf.images, { url: url, primary: isPrimary }];
      if(isPrimary){ S.hf.imageUrl = url; }
      uploaded++;
      render(); // re-render after each upload so user sees progress
    }
  }
  if(uploaded > 0) toast(uploaded+' photo'+(uploaded>1?'s':'')+' uploaded successfully!');
  else toast('Upload failed. Check Firebase Storage rules.','err');
}

function removeImage(idx){
  const imgs = [...(S.hf.images || [])];
  const wasPrimary = imgs[idx]?.primary;
  imgs.splice(idx, 1);
  // If we removed the primary, make first remaining primary
  if(wasPrimary && imgs.length > 0){
    imgs[0].primary = true;
    S.hf.imageUrl = imgs[0].url;
  } else if(imgs.length === 0){
    S.hf.imageUrl = '';
  }
  S.hf.images = imgs;
  render();
}

function setPrimaryImage(idx){
  const imgs = (S.hf.images || []).map((img, i) => ({...img, primary: i === idx}));
  S.hf.imageUrl = imgs[idx]?.url || '';
  S.hf.images = imgs;
  render();
}
async function markPaid(key){
  const expiry=new Date(Date.now()+30*864e5).toISOString(),now=new Date().toISOString();
  await db.ref(`sharedAdmins/${key}`).update({plan:'paid',planExpiry:expiry,lastPaid:now});
  await db.ref(`payments/pay_${Date.now()}`).set({adminEmail:key,amount:999,date:now,status:'paid',plan:'monthly'});
  toast('Payment marked. Plan extended 30 days.');
}
async function saveSiteSettings(){
  set({settingsSaving:true});
  try{await db.ref('siteSettings').set(S.siteSettings);toast('Website settings saved!');}
  catch(e){toast('Save failed: '+e.message,'err');}
  set({settingsSaving:false});
}
async function delReview(id){
  const k=S.myAdmin.hotelId||S.myAdmin.key;
  await db.ref(`reviews/${k}/${id}`).remove();
  set({delId:null,delType:''});toast('Review removed.');
}
async function updBooking(id,status){await db.ref(`bookings/${id}`).update({status});toast('Booking '+status+'!');}
async function delBooking(id){await db.ref(`bookings/${id}`).remove();set({delId:null,delType:''});toast('Booking removed.');}

// ══════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════
function toast(msg,t='ok'){set({toast:{msg,t}});setTimeout(()=>set({toast:null}),3500);}
function el(tag,a,...c){
  const e=document.createElement(tag);
  if(a)Object.keys(a).forEach(k=>{
    if(k==='class')e.className=a[k];
    else if(k.startsWith('on'))e.addEventListener(k.slice(2).toLowerCase(),a[k]);
    else if(k==='style'&&typeof a[k]==='object')Object.assign(e.style,a[k]);
    else if(['checked','disabled','selected','value'].includes(k))e[k]=a[k];
    else e.setAttribute(k,a[k]);
  });
  c.flat(9).forEach(ch=>{if(ch==null||ch===false)return;e.appendChild(typeof ch==='string'||typeof ch==='number'?document.createTextNode(String(ch)):ch);});
  return e;
}
function svg(paths,sz=16){
  const s=document.createElementNS('http://www.w3.org/2000/svg','svg');
  s.setAttribute('width',sz);s.setAttribute('height',sz);s.setAttribute('viewBox','0 0 24 24');
  s.setAttribute('fill','none');s.setAttribute('stroke','currentColor');s.setAttribute('stroke-width','2');
  s.setAttribute('stroke-linecap','round');s.setAttribute('stroke-linejoin','round');
  paths.forEach(d=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);s.appendChild(p);});
  return s;
}
const IC={
  dash:['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'],
  hotel:['M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z','M9 22V12h6v10'],
  money:['M12 1v22','M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6'],
  users:['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75','M9 7a4 4 0 100 8 4 4 0 000-8z'],
  share:['M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8','M16 6l-4-4-4 4','M12 2v13'],
  bar:['M18 20V10','M12 20V4','M6 20v-6'],
  book:['M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z','M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z'],
  settings:['M12 15a3 3 0 100-6 3 3 0 000 6z','M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'],
  globe:['M12 2a10 10 0 100 20A10 10 0 0012 2z','M2 12h20','M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z'],
  plus:['M12 5v14','M5 12h14'],
  edit:['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7','M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z'],
  trash:['M3 6h18','M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6','M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2'],
  check:['M22 11.08V12a10 10 0 11-5.93-9.14','M22 4L12 14.01l-3-3'],
  x:['M18 6L6 18','M6 6l12 12'],
  eye:['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z','M12 9a3 3 0 100 6 3 3 0 000-6z'],
  eyeoff:['M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94','M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19','M1 1l22 22'],
  logout:['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  warn:['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z','M12 9v4','M12 17h.01'],
  copy:['M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-4-4z','M14 2v4a2 2 0 002 2h4'],
  save:['M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z','M17 21v-8H7v8','M7 3v5h8'],
  act:['M22 12h-4l-3 9L9 3l-3 9H2'],
  paint:['M12 19l7-7 3 3-7 7-3-3z','M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z','M2 2l7.586 7.586','M11 11a2 2 0 100 4 2 2 0 000-4z'],
  bell:['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9','M13.73 21a2 2 0 01-3.46 0'],
  plan:['M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z','M1 10h22'],
  star:['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
};
function ic(n,s=16){return svg(IC[n]||[],s);}
function sp(s=14,c1='rgba(255,255,255,.3)',c2='#fff'){const x=document.createElement('span');x.className='spin';x.style.cssText=`width:${s}px;height:${s}px;border:2px solid ${c1};border-top-color:${c2};border-radius:50%;`;return x;}
function sp2(){return sp(28,'var(--line)','var(--ac)');}
function fmt(d){if(!d)return'—';try{return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}catch{return'—';}}
function fmtT(d){if(!d)return'—';try{return new Date(d).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}catch{return'—';}}
function lbl(t){return el('label',{style:{fontSize:'10px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'.06em',color:'var(--ink-f)',display:'block',marginBottom:'5px'}},t);}
function starsStr(n){return'★'.repeat(Math.round(n||0))+'☆'.repeat(5-Math.round(n||0));}

// ══════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════
