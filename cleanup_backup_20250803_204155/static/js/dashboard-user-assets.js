/**
 * Dashboard User Assets
 * Handles asset functionality for the Telkom Aset user dashboard
 */

// Load asset data with retry mechanism
async function loadAsetData(page = 1, retryCount = 0) {
  try {
    // Show loading state first
    const container = document.getElementById("assetGrid");
    if (container) {
      container.innerHTML = `
        <div class="col-12 text-center">
          <div class="spinner-border text-danger mb-3" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <h4>Memuat aset tersedia...</h4>
          <p class="text-muted">Mohon tunggu sebentar${retryCount > 0 ? ` (Percobaan ke-${retryCount + 1})` : ''}</p>
        </div>
      `;
    }

    // Get filter values if elements exist
    const assetTypeFilter = document.getElementById("assetTypeFilter");
    const locationFilter = document.getElementById("locationFilter");
    const priceFilter = document.getElementById("priceFilter");

    const params = new URLSearchParams();
    params.append("page", page);
    params.append("per_page", 9); // 9 items per page
    
    if (assetTypeFilter && assetTypeFilter.value) {
      params.append("asset_type", assetTypeFilter.value);
    }
    
    if (locationFilter && locationFilter.value) {
      params.append("location", locationFilter.value);
    }
    
    if (priceFilter && priceFilter.value) {
      params.append("price_range", priceFilter.value);
    }

    console.log(`Loading assets with params: ${params.toString()} (Attempt: ${retryCount + 1})`);
    
    // Define all API endpoints to try - only use the working endpoint
    const endpoints = [
      `/api/aset-tersedia?${params}`,
      `/rental/api/assets/available?${params}`
    ];
    
    let lastError = null;
    
    // Try each endpoint in sequence
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(endpoint, { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' } // Prevent caching
        });
        clearTimeout(timeoutId);
        
        // Check if response is ok
        if (!response.ok) {
          console.warn(`Endpoint ${endpoint} returned status: ${response.status}`);
          continue; // Try next endpoint
        }
        
        const data = await response.json();
        
        if (data.success) {
          console.log(`Successfully loaded data from ${endpoint}`);
          // The API returns data in 'data' or 'assets' field
          const assetData = data.data || data.assets || [];
          displayAsetData(assetData);
          if (data.pagination) {
            updatePaginationControls(data.pagination);
            currentPage = data.pagination.current_page || data.pagination.page || 1;
          }
          
          // Clear any previous error messages
          const alertContainer = document.getElementById("alertContainer");
          if (alertContainer) {
            alertContainer.innerHTML = '';
          }
          
          // Update dashboard stats after loadings
          if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
          }
          
          ret function
        } e
          
          lastError = data.message || "Unknown 
        }
      } catch (endpointError) {
        console.warn(`Error with endpoint ${endpoint}:
        le;
      }
    }
    
    // ed
    t);
    
  } catch (error) {
    console.error("Error loading aset data:", error);
    
    // Retry logic y
    if (retryCount < 2) {
    s
      console.log(`Retrying in ${retryDelay}ms... (Attempt $
      
      // Show retry message
      const container = document.getElementById("assetGrid");
      
        container.innerHTML = `
          <div class="col-12 text-center">
            <div class
              <span class="visuan>
            </div>
            <h4>Mencoba memuat ulang...</h4>
            <p class="text-muted">Percobaan ke-${retryCount + p>
          </div>
        `;
      }
      
      setT
       1);
      tryDelay);
      return;
    }
    
    // All reta
    ca");
    ");
    
    // Add a reload button
    const alertContainer = document.getElementById("alertContainer");
    {
      alertContainer.inner
        <div class="alert alert-info alert-dismissible fade show mt-3">
          <i class="fas f
          <button type="button" cla
            Coba Muat Ulang
          </button>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    }
  }
}

// tions
a) {

    // Try multiple API es
    const endpoints = [
      "
      "/api/kecamatan-list"
    ];
    
    let data = null;
    
    ints) {
      try {
    );
        if (response.ok) {
          d();
          if (data.success) {
            break;
          }
        }
      } catch (err) {
        conrror);
      }
    }
    
    // t
    i
    ");
      data = {
        success: true,
        data: [
          "Ase,
          "Gayungan", ",
          "Karajo",
          "Pabean Cantian", "Pakal", "Rungkut", "Sambikerep", "Saw,
          "Semampir", "Simokerto", "Sukolilo", "Sukomanunggal", "Tambak
          "Tandes", "Tegalsari", "Tenggilis Mejoyo", "Wiyung", "Wonocolo",
          "Wonokromo"
        ]
      };
    }

    if (
     
r");
      if (select) {
        select.innerHTML = '<option v
        data.data.forEach((kecamatan) => {
          select.in;
        });
      }

      // Upter
      ct");

        favoritSelect.innerHTMn>';
        data.data.forEach((kecamatan) => {
          favoritSelect.intion>`;
        });
      }
    }
  } catch (
    con);
    
    // Fallback: Ads
    const defaultKecamatan = [
    s",
      "Gayungan", "Genteng", "Gubeng", "Gunung Anyar", "gan",
      "Karang Pilang", "Kenjerrejo",
      "Pabean Cantian", "Pakal", "Rungkut", "Sambikerep", "Saw
      "Semampir", "Simokerto", "Sukolilo", "Sukomanunggal", "Tambakari",
      "Tandes", "Tegalsari", "Tenggilis Mejoyo", "Wiyung", "Wonocolo",
      "Wonokromo"
    ];
    
    const select ;
    ifct) {
    on>';
      defaultKecamatan.forEach((kecamatan) => {
        select.in
      });
    }

    const
    i{

      defaultKecamatan.forEach((kecamatan) => {
        favoritSelect.inion>`;
      });
    }
  }
}

// set data
f) {
;
  
  if (!container) {
    console.error("Asset grid container not found!");
  
  }

  if (!aset) {
   `
5">
        <i class="fas fa-home text-muted mbi>
        <h5 class="text-mut
        <p class="text-muted">Admin belum mp>
      </div>
    `;
    return;
  }

  let html ";
  a{
s
    const assetTanah";
    const isTanah = assetType 
    
    html += `
      <div class="col-md-6 col-lg-4">
    
          <di-body">
            <div class="d-flex justif2">
              <span class="badge bg-${
                isTanah ? "succesry"
              } rounded-pill">
                ${isTanah ? "Tanah" : "}
              </span>
              <div class="d-fl">
                <span class="badge bg-success text-white pill">
                  ${a
                </span>
                <i class="fas fa-heart favorite-heart" 
                   onclick="toggleFavorite(${a" 
                   titlrit"
                   data-aset-id="${aset.id}"></i>
              </div>
            </div>
            
            <h6 clas${
              aset"
            ">
              ${aset.name || aset.alamat || "Alamat tidak dia"}
            </h6>
            
            <div class="mb-2">
              <smd">
            >
                ${aset.kecamat
      aset.kelurahan ? ", " + aset.kelur"
    }
              </small>
            </div>
         
            <div class
              <div>
            </small>
                <strong>${aset.luas_tanah || atrong>
              </div>
              ${
                !isTanah && (aset.luas_bangunan || aset.building_size)
                  ? `
              <d>
                <small class="text-muted d-block">Luas Bangunan</small>
                <stro
              </div>`
                  : '<div class="col-6"></div>'
              }
            </div>
            
            ${
              !isT
                ? `
            <d-3">
              <div class="col-6">
                <sml>
                <strong>${aset.kamar_tidur || trong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Kamar Mandi</small>
                <strg>
              </div>
            </div>`
                : ""
            }
            
            ${
             
                ? `
            <d-2">
              <small class="text/small>
              <p cldmin}</p>
            </div>`
                : ""
            }
            
            <div cla
             2">
             0)}/bulan
              </div>
              <small class="text-muted d-block 
              <div class="btn-group btn-group-sm w-100">
                <but
                  aset.id
                }, '${aset.jenis}')">
                  <i class="fas fa-eye me-1"></i>Detail
                </button>
                <button class="btn btrm(${
                  aset.id
                }, '${ase">
                  <i class="fas fa-handshake me-1"></i>Sewa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  cont html;

ts
  loadFavoriteStatus();
}

// Update pagination co
f
n;
  totalPages = pagination.tot

  const paginationList = docum

trols
  if (pagination.total_pages <= 1) {
e";
    return;
  } else {
    paginationList.style.display = "flex";
  }

  // Generate pagination buttons
  g
}

// Generate pagination buttons
fation) {
");
  const currentPage = paginati
  const totalPages = pagination.total_pages;

  let html = "";


  html += `

      <button class=${
    !pagina
  } 
              title="Halaman sebelumnya (← atau ArrowLeft)">
        <i class="fas fa-chevron-left me-1
    tton>
    </li>
  `;

  // Calco show
  le
;

  // Adjust range if we're near the beginning ond
  if (currentPage <= 3) {
Pages);
  }
  if (currentPage > total{
    startPage = Math.max(1, totalPages - 4);
  }

  // First page (if not in range)
  i {
tml += `
      <li class="page-item">
        <button class=1</button>
      </li>
    `;
    if (startPage > 2) {
      html 
      ">
          <span class="p
        </li>
      `;
    }
  }

  //  range
  f i++) {
`
      <li class="page-item: ""}">
        <button class="page-link" onclick="cha
      i === c : ""
    }>
          ${i}
        </button>
      </li>
    `;
  }

  // L range)
  i
{
      html += `
        <li class="page-item ">
          <span class="page-link">..</span>
        </li>
      `;
    }
    html += `
      <l
     tton>
      </li>
    `;
  }

  // Non
  h `
>
      <button cl
    !pagina""
  } 
              title="Halaman selanjutnya (→ atau ArrowRight)">
        Next<i class="fas fa-chevron-right>
    
    </li>
  `;

  paginatml;
}

// Change page
fage) {

  if (newPage ntPage) {
    return;
  }

  // Show lte
  c
L = `
    <div class="col-12 
      <div class="spinner-border text-danger" role="status">
        <span class="visu
      </div>
      <p class="mt-2 text-muted">Memuat halaman ${newPage}...</p>
    </div>
  `;

  // Disab
  co(
utton"
  );
  paginationButtons.forEach((btn) => (btn.disabled = t;

  //
  loadAsetData(newPage).then(() => {
thly
    document.getElIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

// Sh
fjenis) {
endpoint
  fetch(`/rental/apits/${id}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.data) {
        // Map the data to match expected format
        const asetDatata.data;
        const mappedData = {
          id: asetData.id,
          jenis: asetData.asset_typ
          alamat: asetData.at,
          kecamatan: asetDatan,
          kelurahan: asetData.kelurah,
          luas_tanah: asetData.lua
          luas_bangunan: asetData.luas_bgunan,
          kamar_tidur: asetData.kamar_tidur,
          kamar_mandi: asetData.kamar_mandi,
          jumlah_lantai: asetData.jumlah_lantai,
          harga_sewa: asetData.harga_sewa,
          harga_prediksi:
            asetData.harga_prediksi || asetData. * 100,
        };
        showDetailModal(m;
      } else {
        alrt(
          "Gagal memuat detail aset:r")
        );
      }
    })
    .catchor) => {
      c;
      );
    });
}

// Show
f
d");
  container.innerHTML`
    <div class="col-12 text-c>
      <i class="fas fa-exclamation-triangle text-warning 
      <h5 class="text-mutn</h5>
      <div class="alert alert-warning">
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${message}
      </div>
      <p class="text-muted">Silakan coba lagi atau hubun>
    </div>
  `;
}

// F
f {
;
}how error with mock dataion showErrorWithMockData(messagew();
}nstance.shoodalIal);
  mododal(motstrap.Mw bostance = nelInda
  const momodalhow  S //);
  
 modalpendChild(ent.body.ap
  documdocumento  todaldd m// A;
  
  </div>
  `
    /div> <div>
     
        </tton>        </buwa
  kan Se/i>Aju"><e-1andshake ms="fas fa-has<i cl            ')">
ata.jenis}etDa.id}, '${as${asetDatlForm("showRentar" onclick=n btn-dangess="bton" cla"buttton type=    <but>
      button        </tup
  /i>Tu><-1"fa-times meclass="fas i  <
           ">"modals=iss-dism data-bary"line-secondbtn-outlass="btn " cnpe="butto  <button ty
        ">ooters="modal-fdiv clas    <>
         </div</div>
   
               </div>v>
          </di    v>
       di</       
             </p>            
  k disewauntuSiap                  i>
   </2">ger me--dan-circle textckas fa-che="fass     <i cl      >
         "lass="mb-1      <p c           </p>
                an sah
    dikat lengkapertif S             >
      /ie-2">< mtext-dangerertificate s="fas fa-clas      <i c       ">
       "mb-1=   <p class            p>
          </          n}
 .kecamatai ${asetData strategis d    Lokasi             
   e-2"></i>danger mt-texlt -marker-a-mapfas="fas  <i clas                 
  s="mb-1">as<p cl           >
       ody"s="card-b <div clas     
          iv>/d        <     </h6>
   i Tambahanformasmb-0">Inlass="   <h6 c         ">
      g-light-header bass="card <div cl     
          ard">iv class="c <d     
                    </div>
            /div>
               <>
     div      </         /div>
              <         si</small>
estimamuted">"text-ss=l cla    <smal                
   100)}</h4>harga_sewa *ata.si || asetDharga_predikcy(asetData.rmatCurrenp ${fo   <h4>R                  </h6>
 Nilai Aset-1">t-muted mblass="tex<h6 c                 
     -6">ss="col cla    <div         
          </div>            l>
     mal</s">per bulantext-mutedass="clll    <sma                )}</h4>
   a.harga_sewaency(asetDat{formatCurrer">Rp $xt-dangs="te <h4 clas                   </h6>
  ewaarga S1">H-muted mb-ext class="t      <h6            l-6">
    ss="co   <div cla            >
     center"w text-ss="rola <div c                 
">-body"card class=     <div         </div>
              
    /h6>rmasi Harga<nfo">Ib-0class="m6       <h      >
      -white"xtanger teader bg-dd-hess="car   <div cla       >
      rd mb-3""ca <div class=             l-md-6">
"cov class=     <di 
         
         >/div <     }
           `       </div>
            
        </div>    >
        "col-6"div class=         <v>
            </di          
 </p>   <p>Tanah       
        is</h6>Jenmb-1">ext-muted "t <h6 class=                
 col-6">div class=" <          3">
     row mb-iv class="        <d
      `  ` :          >
          </div   
       </div>  
           n</p>+ Bangunaanah  <p>T            </h6>
     Jenis"> mb-1"text-mutedlass=       <h6 c        -6">
   oliv class="c <d              
 iv>  </d         
     | '1'}</p>ah_lantai |setData.juml{a      <p>$         6>
    Lantai</h">Jumlah-1d mbtext-mutelass="     <h6 c          ol-6">
   ="cdiv class    <            >
 mb-3"ass="rowcl<div               
    
            </div>        
         </div>
           >}</pndi || '0'kamar_maata.<p>${asetD                  >
 Mandi</h6arammb-1">Kd ="text-mutesscla     <h6           >
   "col-6"v class=    <di   >
         iv       </d         | '0'}</p>
tidur |mar_etData.ka    <p>${as              r</h6>
mar Tidu">Kauted mb-1-mclass="text  <h6            ">
     ol-6s="c   <div clas             ">
"row mb-3div class=     <        `
 nan' ? ngu== 'bata.jenis =${asetDa            
           
        </div>          </div>
          >
       ²</p} man || '-'angunata.luas_basetD       <p>${          n</h6>
 uas Bangunab-1">Lted m-muext="t<h6 class              ">
    6ol-v class="c       <di
          </div>           
     m²</p>uas_tanah}a.lsetDat{a     <p>$     
        </h6>>Luas Tanahted mb-1"="text-mu<h6 class                  ol-6">
lass="cv cdi <           >
    "row mb-3"ss=v cla   <di                
         div>
        </div>
          </         '}</p>
   n || '-lurahake${asetData. <p>               
  >han</h6-1">Keluramuted mbt-ass="tex   <h6 cl            l-6">
   ss="cola <div c               v>
   </di            an}</p>
 .kecamat>${asetData  <p            6>
    ecamatan</hed mb-1">K="text-mutclass  <h6            
     -6">"coldiv class=     <
           ow mb-3">v class="rdi <        
                   p>
}</alamattData.${ase"mb-3">   <p class=           /h6>
lamat<">Ab-1ext-muted m class="t         <h6>
     -md-6" class="coldiv     <      
 row">s="<div clas         ody">
 dal-bass="mo cl       <diviv>
   </d    tton>
  bual"></"modiss=-dism" data-bslosebtn-c=" class"button"utton type=   <bh5>
                 </set
ail Aet       D    "></i>
 2 me-xt-dangertecle nfo-cir="fas fa-ii class     <       l-title">
s="modaclas     <h5 >
     -light"ader bgmodal-he"ss=  <div cla">
      -content"modallass=v c   <di   l-lg">
log moda="modal-dialassv c= `
    <diL innerHTMl.al';
  modalMod 'asetDetai  modal.id =ade';
= 'modal fssName dal.cla');
  molement('divreateEdocument.codal = nst m co
 dal HTML/ Create mo  }
  
  /;
al.remove() existingMod   ngModal) {
(existi
  if tailModal');'asetDeById(.getElement= documentngModal ti exis const if any
 sting modal/ Remove exiata) {
  /l(asetDetailModaction showDmodal
funow detail 
}

// ShsetId}`;l/form/${as = `/rentaion.hrefndow.locat wi page
 rental formect to 
  // Redirype) {setT astId,m(assetalForowRention shform
funcntal how re
}

// S);
  });ite:', erroring favor toggl'Errorrror(   console.e}
 d');
    e('favoriteList.remov.class   element else {
   ed');
    }add('favoritassList.ment.clle  eed) {
    ritvosFa(ils
    if all fai UI if API c Revert   //
 r => {h(errotc})
  .ca    }
    }

    Stats();teDashboard   upda     
ion') {funct === 'oardStatsashbeof updateDif (typ
      n dashboardte count iripdate favo  // Ue {
    ls
    } er);rrodata.evorite:', ling faError toggror('.eronsole  c }
    ;
     ed')ve('favoritist.remont.classLme
        ele  } else {;
    'favorited')st.add(ment.classLi
        ele) {avoritedf (isF   i   all fails
I cif AP Revert UI 
      //uccess) {data.s if (!a => {
   en(dat
  .the.json())e => respons(responshen .t })
  })
 assets'
    'rental_ce:asset_sour     ntal',
 t_type: 're
      asseassetId,_id:  asset({
     fyON.stringi: JS  body,
   }
   ation/json'icpe': 'applontent-Ty{
      'C headers: 'POST',
   d: metho
    oint, {etch(endp 
  fes/add';
 oritpi/fav '/a/remove' :tesfavoried ? '/api/= isFavoritndpoint 
  const ee statusitvorpdate fal API to u/ Cal
  
  /);
  } 500  },  ');
move('pulsereclassList.ement.el     ) => {
 meout((etTi    slse');
('put.addlassLiselement.c
    imationd pulse an// Ad    ted');
dd('favori.classList.a    elemente {
 elsd');
  }ite'favore(ist.removsLent.clas elemed) {
   f (isFavoritte
  i UI updaimistic/ Opt /
  
 ed');ins('favoritist.contament.classL eleed =ritt isFavoed
  conseady favorit alrheck if) {
  // CentsetId, elemavorite(asggleFon to
functie statusavoritoggle f}

// T;
  });
 error)',status:e king favoritError checole.error('
    cons> {tch(error = })
  .ca   }
   });
  }
    
       ited');move('favorclassList.reart.          he {
 else;
        }'favorited')assList.add(   heart.cl
       tId))) {seInt(asseludes(pares.inc.favorit  if (data      );
-aset-id'ute('datatribart.getAt= heId assetnst 
        coh(heart => {.forEaciteHearts favor  atus
    st on favoriteased bconse heart i   // Updates) {
   a.favorit dat.success &&(data{
    if n(data => ())
  .theone.jsrespons=> e nspohen(res)
  .t
  }s })tIdet_ids: asseingify({ ass: JSON.str,
    body
    }ation/json'pplict-Type': 'a     'Contenrs: {
 
    heade 'POST',  method:e', {
  tiplules/check-mapi/favorit fetch('/ at once
 setsl asor alus f statorite fav // Checkd'));
  
 data-aset-itAttribute('get => heart.eararts).map(hvoriteHerray.from(fads = Anst assetI
  coDsll asset I
  // Get aturn;
  0) reth === s.lengeHeartvorit
  if (faterts to updaany heaf we have  // Check i);
  
 te-heart'All('.favorirySelector.quementearts = docuiteHonst favorrts
  c heal favoriteal{
  // Get Status() tedFavorifunction loaassets
displayed atus for favorite stoad 
// L  });
}
ext: false
_nas    h: false,
evas_pr    hs: 1,
page  total_: 1,
  urrent_pagels({
    cationControdatePagin
  upionMock paginat
  
  // kData);Data(mocdisplayAsetta
  ck da Display mo
  //`;
  }
     >
      </divtton>
 /bue"><"Closa-label="alert" arismiss= data-bs-ditn-close"" class="bttontype="bu    <button 
    }${message
        2"></i>le me-triangxclamation-a-es="fas f clas   <i  
   rt">"alehow" role= fade slessib-dismirning alert-wart alert"aless=   <div cla   ML = `
r.innerHTneontaitC
    aleriner) {ontalertC
  if (a");ainertContalerd("yIgetElementBcument.ainer = doalertContconst 
  essager mow erro
  // Sh
  
  ];
    }"Tersedia"status:       
8000000,wa: arga_se h0,
     : 30ahuas_tan    l
  Rungkut",. 78,  Nokut Asri. RungJlamat: "    al",
  n: "Rungkutecamata,
      ke: "tanah"  asset_typ
    umahan","Tanah Per  name: 
     3,    id:
    {
    },
  Tersedia"s: "      statu35000000,
a: a_sew      harg 4,
mandi:kamar_     r: 0,
 tiduamar_      k
: 600,nanluas_bangu00,
      nah: 8    luas_tari",
  , Tegalsa No. 45ki Rahmat: "Jl. Basu   alamatari",
   "Tegalsamatan:      kecnan",
 ngu: "baype    asset_tn",
  Moder Kantor unanBangame: " n: 2,
        id   {
     },
 "
  diaerses: "Ttuta0,
      s00000a: 15   harga_sew
   tanah: 500,      luas_ubeng",
 G No. 123,sadaDharmahumat: "Jl.       alaeng",
: "Gubkecamatan   ,
    "tanah" asset_type:",
     ategisStrersial om: "Tanah K
      name     id: 1,
     { [
 mockData =ata
  consteate mock dCr
  // ;
  etGrid")yId("asstBgetElemen document. =ernst contain) {
  co
funct

// S