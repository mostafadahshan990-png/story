const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString('ar-EG')+' ج.م';

/* ===== المنتجات الافتراضية (عدّل عليها) ===== */
const DEF=[
{id:1,n:'طقم أكواب زجاج',p:240,o:320,c:'المطبخ',e:'🥛',d:'6 أكواب زجاج سميك مقاوم للحرارة، مناسب للشاي والعصير.'},
{id:2,n:'إبريق قهوة تركي',p:180,o:0,c:'المطبخ',e:'☕',d:'إبريق نحاسي بمقبض عازل للحرارة.'},
{id:3,n:'خلاط كهربائي 600 وات',p:1450,o:1800,c:'أجهزة',e:'🍹',d:'خلاط بسرعتين وإبريق 1.5 لتر.'},
{id:4,n:'مكواة بخار',p:980,o:0,c:'أجهزة',e:'♨️',d:'مكواة بقاعدة سيراميك وخزان مياه كبير.'},
{id:5,n:'مروحة مكتبية',p:650,o:790,c:'أجهزة',e:'🌀',d:'3 سرعات وهادئة، مناسبة للمكتب وغرفة النوم.'},
{id:6,n:'طقم ملايات قطن',p:1100,o:1400,c:'مفروشات',e:'🛏️',d:'ملاءة سرير مع 2 كيس مخدة، قطن 100%.'},
{id:7,n:'مخدة طبية',p:320,o:0,c:'مفروشات',e:'💤',d:'مخدة ميموري فوم تدعم الرقبة.'},
{id:8,n:'سجادة صالون',p:1900,o:2400,c:'ديكور',e:'🟫',d:'سجادة ناعمة مقاس 160×230 سم.'},
{id:9,n:'مصباح ليد للمكتب',p:290,o:0,c:'ديكور',e:'💡',d:'إضاءة قابلة للتعديل بشحن USB.'},
{id:10,n:'نبتة زينة بإصيص',p:150,o:0,c:'ديكور',e:'🪴',d:'نبتة طبيعية سهلة العناية للمكاتب والبيوت.'},
{id:11,n:'منظم أدراج',p:95,o:130,c:'تنظيم',e:'🗂️',d:'سلة تخزين قابلة للطي بمقاسات مختلفة.'},
{id:12,n:'حقيبة تخزين ملابس',p:120,o:0,c:'تنظيم',e:'🧳',d:'تحفظ الملابس من الغبار والرطوبة.'},
{id:13,n:'طقم سكاكين ستانلس',p:360,o:450,c:'المطبخ',e:'🔪',d:'6 قطع بحامل خشبي وشفرات حادة.'},
{id:14,n:'غلاية مياه كهربائية',p:520,o:0,c:'أجهزة',e:'🫖',d:'سعة 1.7 لتر وإغلاق تلقائي.'},
{id:15,n:'ستارة بلاك أوت',p:430,o:560,c:'مفروشات',e:'🪟',d:'تحجب 95% من الضوء، مقاس 140×250.'},
{id:16,n:'إطار صور خشب',p:110,o:0,c:'ديكور',e:'🖼️',d:'إطار 30×40 جاهز للتعليق.'}];

let S={products:DEF,cart:{},wish:[],orders:[],cat:'الكل',sort:'def',q:'',cpn:0,onlyWish:false,max:5000,deals:false,show:8};
const KEY='store_v1';
try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);S={...S,...o,cat:'الكل',q:'',onlyWish:false}}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({products:S.products,cart:S.cart,wish:S.wish,orders:S.orders,cpn:S.cpn}))}catch(e){}};
const toast=t=>{const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('on'),1800)};
const bg=id=>`background:hsl(${(id*47)%360} 55% 88%)`;
const byId=id=>S.products.find(p=>p.id==id);

function cats(){const cs=['الكل',...new Set(S.products.map(p=>p.c))];
  $('#cats').innerHTML=cs.map(c=>`<button class="chip ${c==S.cat?'on':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')+
  `<select id="sort" aria-label="ترتيب"><option value="def">الترتيب الافتراضي</option><option value="lo">السعر: الأقل أولاً</option><option value="hi">السعر: الأعلى أولاً</option><option value="off">الأكثر تخفيضاً</option></select>`;
  $('#sort').value=S.sort}

function grid(){let l=S.products.filter(p=>(S.cat=='الكل'||p.c==S.cat)&&(!S.onlyWish||S.wish.includes(p.id))&&(p.n+p.d+p.c).includes(S.q)&&p.p<=S.max&&(!S.deals||p.o));
  if(S.sort=='lo')l.sort((a,b)=>a.p-b.p);if(S.sort=='hi')l.sort((a,b)=>b.p-a.p);
  if(S.sort=='off')l.sort((a,b)=>(b.o?b.o-b.p:0)-(a.o?a.o-a.p:0));
  const tot=l.length;l=l.slice(0,S.show);$('#lm').style.display=tot>S.show?'inline-block':'none';
  $('#grid').innerHTML=l.length?l.map(p=>`<article class="card"><div class="ph" style="${bg(p.id)}" data-view="${p.id}">${esc(p.e)}${p.o?`<span class="tag">-${Math.round(100-p.p/p.o*100)}%</span>`:''}<button class="heart" data-wish="${p.id}" aria-label="مفضلة">${S.wish.includes(p.id)?'❤️':'🤍'}</button></div><div class="info"><span class="cat">${esc(p.c)} · ${stars(p)}</span><h3>${esc(p.n)}</h3><div class="price">${fmt(p.p)}${p.o?`<span class="old">${fmt(p.o)}</span>`:''}</div><button class="btn" data-add="${p.id}">أضف للسلة</button></div></article>`).join(''):'<p class="empty">لا توجد منتجات مطابقة. جرّب كلمة بحث أو تصنيفاً آخر.</p>';
  $('#cW').textContent=S.wish.length;$('#cC').textContent=Object.values(S.cart).reduce((a,b)=>a+b,0)}

const refresh=()=>{cats();grid();save()};

function totals(){let sub=0;for(const id in S.cart){const p=byId(id);if(p)sub+=p.p*S.cart[id]}
  const disc=Math.round(sub*S.cpn/100),ship=sub-disc>=1000||!sub?0:50;return{sub,disc,ship,tot:sub-disc+ship}}

function cart(){const ids=Object.keys(S.cart).filter(i=>byId(i));
  if(!ids.length){$('#cB').innerHTML='<p class="empty">السلة فارغة. أضف منتجات من المتجر لتبدأ.</p>';return}
  const t=totals();
  $('#cB').innerHTML=ids.map(i=>{const p=byId(i);return`<div class="row"><div class="em" style="${bg(p.id)}">${esc(p.e)}</div><div class="m"><b>${esc(p.n)}</b><div>${fmt(p.p)}</div></div><div class="q"><button data-inc="${i}" aria-label="زيادة">+</button><span>${S.cart[i]}</span><button data-dec="${i}" aria-label="نقص">−</button></div><button class="x" data-rm="${i}" aria-label="حذف">🗑</button></div>`}).join('')+
  `<div class="cpn"><input id="cp" placeholder="كود الخصم" aria-label="كود الخصم"><button class="btn alt" id="cpb">تطبيق</button></div>
  <div class="sum"><div><span>المجموع</span><span>${fmt(t.sub)}</span></div>${t.disc?`<div><span>الخصم (${S.cpn}%)</span><span>-${fmt(t.disc)}</span></div>`:''}<div><span>الشحن</span><span>${t.ship?fmt(t.ship):'مجاني'}</span></div><div class="t"><span>الإجمالي</span><span>${fmt(t.tot)}</span></div></div>
  <button class="btn" style="width:100%;margin-top:12px" id="go">إتمام الطلب</button>`}

function view(id){const p=byId(id);$('#pT').textContent=p.n;
  $('#pB').innerHTML=`<div class="ph" style="${bg(p.id)};border-radius:12px;cursor:default;height:200px;font-size:6rem">${esc(p.e)}</div><p class="cat">${esc(p.c)}</p><p>${esc(p.d)}</p><div class="price" style="font-size:1.4rem">${fmt(p.p)}${p.o?`<span class="old">${fmt(p.o)}</span>`:''}</div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn" style="flex:1" data-add="${p.id}">أضف للسلة</button><button class="btn alt" data-wish="${p.id}">${S.wish.includes(p.id)?'❤️ في المفضلة':'🤍 للمفضلة'}</button></div>`;
  $('#dP').showModal()}

function checkout(){const t=totals();
  $('#kB').innerHTML=`<form id="f"><div class="two"><div><label for="fn">الاسم الكامل</label><input id="fn" required></div><div><label for="fp">رقم الموبايل</label><input id="fp" type="tel" required pattern="01[0-9]{9}" title="رقم موبايل مصري من 11 رقم"></div></div><div class="two"><div><label for="fc">المحافظة</label><input id="fc" required></div><div><label for="fa">العنوان بالتفصيل</label><input id="fa" required></div></div><label for="fm">ملاحظات (اختياري)</label><textarea id="fm" rows="2"></textarea><label>طريقة الدفع</label><div><label style="font-weight:400"><input type="radio" name="pay" value="الدفع عند الاستلام" checked style="width:auto"> الدفع عند الاستلام</label><label style="font-weight:400"><input type="radio" name="pay" value="فودافون كاش" style="width:auto"> فودافون كاش</label></div><div class="sum" style="margin-top:12px"><div class="t"><span>الإجمالي</span><span>${fmt(t.tot)}</span></div></div><button class="btn" style="width:100%;margin-top:12px">تأكيد الطلب</button></form>`;
  $('#dK').showModal()}

function admin(){const o=S.orders;
  $('#aB').innerHTML=`<h4>إضافة منتج</h4><form id="af"><div class="two"><div><label for="an">الاسم</label><input id="an" required></div><div><label for="ac">التصنيف</label><input id="ac" required list="cl"></div></div><datalist id="cl">${[...new Set(S.products.map(p=>p.c))].map(c=>`<option value="${esc(c)}">`).join('')}</datalist><div class="two"><div><label for="ap">السعر</label><input id="ap" type="number" min="1" required></div><div><label for="ao">السعر قبل الخصم (اختياري)</label><input id="ao" type="number" min="0"></div></div><div class="two"><div><label for="ae">إيموجي للصورة</label><input id="ae" value="📦" maxlength="4"></div><div><label for="ad">الوصف</label><input id="ad"></div></div><button class="btn" style="margin-top:10px">إضافة</button></form>
  <h4>المنتجات (${S.products.length})</h4>${S.products.map(p=>`<div class="row"><div class="m">${esc(p.e)} ${esc(p.n)} — ${fmt(p.p)}</div><button class="btn red" data-del="${p.id}">حذف</button></div>`).join('')}
  <h4>الطلبات (${o.length})</h4><div class="tbl">${o.length?o.slice().reverse().map(x=>`<div class="row"><div class="m"><b>#${x.no}</b> · ${esc(x.name)} · ${esc(x.phone)}<br><span class="msg">${esc(x.city)} - ${esc(x.addr)} · ${esc(x.pay)}<br>${x.items.map(esc).join('، ')}</span></div><b>${fmt(x.tot)}</b></div>`).join(''):'<p class="msg">لا توجد طلبات بعد.</p>'}</div>
  <button class="btn alt" id="rs" style="margin-top:14px">إعادة المتجر للوضع الأصلي</button>`;
  $('#dA').showModal()}

document.addEventListener('click',e=>{
  const g=a=>e.target.closest(`[${a}]`);let el;
  if(g('data-close')){e.target.closest('dialog').close();return}
  if(el=g('data-cat')){S.cat=el.dataset.cat;S.show=8;refresh();return}
  if(el=g('data-view')&&!g('data-wish')&&g('data-view')){view(el.dataset.view);return}
  if(el=g('data-wish')){const id=+el.dataset.wish;S.wish=S.wish.includes(id)?S.wish.filter(x=>x!=id):[...S.wish,id];refresh();if($('#dP').open)view(id);return}
  if(el=g('data-add')){const id=el.dataset.add;S.cart[id]=(S.cart[id]||0)+1;refresh();toast('تمت الإضافة للسلة ✓');return}
  if(el=g('data-inc')){S.cart[el.dataset.inc]++;refresh();cart();return}
  if(el=g('data-dec')){const i=el.dataset.dec;if(--S.cart[i]<=0)delete S.cart[i];refresh();cart();return}
  if(el=g('data-rm')){delete S.cart[el.dataset.rm];refresh();cart();return}
  if(el=g('data-del')){if(confirm('حذف المنتج؟')){S.products=S.products.filter(p=>p.id!=el.dataset.del);delete S.cart[el.dataset.del];refresh();admin()}return}
  if(e.target.id=='cpb'){const c=$('#cp').value.trim().toUpperCase();if(c=='WELCOME10'){S.cpn=10;toast('تم تطبيق خصم 10%')}else{S.cpn=0;toast('الكود غير صحيح')}save();cart();return}
  if(e.target.id=='go'){$('#dC').close();checkout();return}
  if(e.target.id=='rs'&&confirm('سيتم مسح كل التعديلات والطلبات. متأكد؟')){try{localStorage.removeItem(KEY)}catch(x){}S={...S,products:DEF,cart:{},wish:[],orders:[],cpn:0};refresh();admin();return}
  if(e.target.tagName=='DIALOG')e.target.close();
});

document.addEventListener('submit',e=>{e.preventDefault();
  if(e.target.id=='f'){const t=totals(),no=1000+S.orders.length+1,v=i=>$('#'+i).value.trim();
    S.orders.push({no,name:v('fn'),phone:v('fp'),city:v('fc'),addr:v('fa'),pay:document.querySelector('input[name=pay]:checked').value,tot:t.tot,items:Object.keys(S.cart).filter(i=>byId(i)).map(i=>byId(i).n+' ×'+S.cart[i])});
    S.cart={};S.cpn=0;refresh();
    $('#kB').innerHTML=`<div class="ok"><div class="big">✅</div><h3>تم استلام طلبك</h3><p>رقم الطلب <b>#${no}</b>. هنتواصل معاك على رقم الموبايل لتأكيد الشحن.</p><button class="btn" data-close>العودة للمتجر</button></div>`}
  if(e.target.id=='af'){const v=i=>$('#'+i).value.trim();
    S.products.push({id:Date.now()%1e9,n:v('an'),c:v('ac'),p:+v('ap'),o:+v('ao')||0,e:v('ae')||'📦',d:v('ad')||'—'});refresh();admin();toast('تمت إضافة المنتج')}
});

document.addEventListener('change',e=>{if(e.target.id=='sort'){S.sort=e.target.value;grid()}});
$('#q').addEventListener('input',e=>{S.q=e.target.value.trim();S.show=8;grid()});
$('#bCart').onclick=()=>{cart();$('#dC').showModal()};
$('#bAdm').onclick=admin;
$('#bWish').onclick=()=>{S.onlyWish=!S.onlyWish;$('#bWish').style.background=S.onlyWish?'var(--gold)':'';$('#bWish').style.color=S.onlyWish?'#000':'';grid()};

/* ===== التقييم والفلاتر والوضع الليلي والعداد ===== */
function stars(p){const r=(3.8+(p.id%12)/10).toFixed(1);return `<span style="color:#f59e0b">★</span> ${r}`}
$('#mx').oninput=e=>{S.max=+e.target.value;$('#mxv').textContent=fmt(S.max);S.show=8;grid()};
$('#dl').onchange=e=>{S.deals=e.target.checked;S.show=8;grid()};
$