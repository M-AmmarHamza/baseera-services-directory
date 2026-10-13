// Baseera Karachi - Master Mockup Database & Service Data

const BASEERA_DATA = {
  districts: [
    { id: 'all', name: 'All Districts' },
    { id: 'dha-clifton', name: 'DHA & Clifton' },
    { id: 'gulshan', name: 'Gulshan-e-Iqbal' },
    { id: 'pechs', name: 'PECHS' },
    { id: 'north-nazimabad', name: 'North Nazimabad' },
    { id: 'bahadurabad', name: 'Bahadurabad' },
    { id: 'malir-cantt', name: 'Malir Cantt' }
  ],

  categories: [
    { id: 'electrician', name: 'Electrician', icon: 'bolt', count: 42, color: 'text-amber-600' },
    { id: 'plumber', name: 'Plumber', icon: 'water_drop', count: 38, color: 'text-sky-600' },
    { id: 'chef', name: 'Home Chef', icon: 'restaurant', count: 29, color: 'text-rose-600' },
    { id: 'painter', name: 'Painter', icon: 'format_paint', count: 19, color: 'text-purple-600' },
    { id: 'ac', name: 'AC Technician', icon: 'mode_fan', count: 54, color: 'text-cyan-600' },
    { id: 'carpenter', name: 'Carpenter', icon: 'handyman', count: 24, color: 'text-amber-800' },
    { id: 'tailor', name: 'Tailor & Stitch', icon: 'styler', count: 31, color: 'text-emerald-700' },
    { id: 'appliances', name: 'Appliance Repair', icon: 'microwave', count: 27, color: 'text-indigo-600' },
    { id: 'cleaning', name: 'Cleaning & Maid', icon: 'sanitizer', count: 35, color: 'text-teal-600' }
  ],

  providers: [
    {
      id: 'tariq-electric',
      name: 'Tariq Mahmood',
      businessName: 'Tariq Electric & Power Works',
      category: 'electrician',
      type: 'individual',
      verified: true,
      urgentReady: true,
      district: 'dha-clifton',
      locality: 'DHA Phase 5, Commercial Area',
      phone: '+92 333 2145890',
      whatsapp: '923332145890',
      rating: 4.9,
      reviewsCount: 128,
      experienceYears: 14,
      jobsCompleted: 840,
      responseTime: '~10 mins',
      rateStarting: 'Rs. 1,000',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA84TvpKa_OrpS-BmIb4qthfCfN90ePqFFE1w3zZ1W1t0QnCDE01ml3JvyvWooDh3UeVYxH1zJrpixrUq7VK41FnMwB4a3wKAnb4y_XIl5SXCd463My2u_Ai2RbIVoLrxNQf_7bmcpESeI7zTERnyNGBfKMLwoxwEq48LOPm9fevQtc_gTZm77hqmbz8m2swCu1dC5-LKhe7KnSfZBv0pvKTS4LQBmPiXCFDDo1iw5tBxTxbrbNqwjw',
      gallery: [
        { title: 'Switchboard & Breaker setup', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh_sRw3hmV3-7S4eNUd-jVO6bSyp0hVjmvJnXG1oQgcAzN4VP_eIJmZkl_MPu4cn6bdK2L8vqRh-o3t5WJiZO5TxWY_sqrtZ3IEN0Z--_cgbhxjNDSjvWO-GU0eiTs0MbgHl_RKimCrBYqcVeAFD5itfUXN0BPc3h_RqJ7QxAG6T4a8tmK_zj2jjST6iDrmQLd7bRv5r8IvN6HyGLW7O7OZgikD5SLl5PGm5qg8hoKu1pyQ2C9_2vX' },
        { title: '3-Phase DB Distribution Box', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2l4P0wqkni4JXap4ad5Xf4HBbfy1jyDHX3FUdMUrFo0396vlt_xfNg48P99hWFZE-TfWOW8xbOZ9wTZBmkBIz6h6b3dlmcr_B_dxRSiddrF71x29Ia7h2L7mo-1vBv2CzpQwSr_h5VXoM-AFpvpuUudH-fkzbk01Jf_tEy8wB3_C_mYqB23LbrEJlKaJ_qIeVMnySPeESilDDoyKX3XwKFzWuhJSG2QGH2NRvAqye0WBFQ9LEBL63' },
        { title: 'Concealed Ambient Lighting', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSlVNm3bhLWBv4knbPMshpC0z6XDbCFHO9owIwla9r13zDyShNaVeE-6_SV5oOIus3Cv-E8e4_PrNq7vOIzw5rUB0yeL5janUJd5hf3iFGQRMuB87CEt72e-FOdn_hVetda96_-HFtpknnr2Yh5m7-rlh9txcmU0X8cZjac4KfWkX0iTyq-5PMDqRBsFBGaEWN-UO3g3JU71qGhooDGtBY6u8-NHtsoNyy7x53jqBr-HLdaitF7Jv' }
      ],
      tags: ['UPS & Solar Repair', 'Breaker Tripping', '3-Phase DB Box', 'Short Circuit Fix'],
      bio: 'Master wireman with 14+ years servicing homes in DHA, Clifton and Saddar. Specialized in troubleshooting heavy load issues, solar inverter integration, and complete concealed wiring.',
      workingHours: '8:00 AM - 10:00 PM (Emergency 24/7)',
      services: [
        { name: 'Emergency Short Circuit Fix', price: 'Rs. 1,500', desc: 'Fault finding, breaker trip resolution & neutral leak test.' },
        { name: 'Solar Inverter / UPS Wiring Check', price: 'Rs. 2,000', desc: 'Battery terminal servicing, phase distribution & surge protection.' },
        { name: 'Main DB Box Rewiring (Per Board)', price: 'Rs. 3,500', desc: 'Circuit labeling, load re-balancing & cable clean-up.' },
        { name: 'Ceiling Fan & Chandelier Fitting', price: 'Rs. 800', desc: 'Secure mounting with vibration insulation & remote setup.' }
      ],
      reviews: [
        { author: 'Dr. Kamran Siddiqui', rating: 5, date: '2 days ago', area: 'DHA Phase 6', text: 'Tariq bhai resolved our neutral leakage problem within 40 minutes that two other electricians could not fix. Very professional and polite.' },
        { author: 'Sumbul Asif', rating: 5, date: '1 week ago', area: 'Clifton Block 4', text: 'Prompt arrival and tidy work. Cleaned up all wiring off the floor after installing the solar changeover switch.' }
      ]
    },
    {
      id: 'irfan-electrician',
      name: 'Muhammad Irfan',
      businessName: 'Irfan Home Electrical Solutions',
      category: 'electrician',
      type: 'individual',
      verified: true,
      urgentReady: true,
      district: 'dha-clifton',
      locality: 'Clifton Block 2 & Gizri',
      phone: '+92 300 9238471',
      whatsapp: '923009238471',
      rating: 4.8,
      reviewsCount: 94,
      experienceYears: 9,
      jobsCompleted: 512,
      responseTime: '~15 mins',
      rateStarting: 'Rs. 800',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdBMSKdjUaZYNoFJVhLPCwp0jLh0A0lFp02qzPqS8thUxIAOt2xcMZ8HJs-p4Yd6BEHLxhxNXSDbnc2XyjuEoXyPDB4fpoSe1wn0uAxNm7anPR5Vm1wbX_1WSVOcP5FMmvam2s6m_UDGAFPsonR65so8bKoVE-wdlliVhajpCE_oAkxu3Hbi6-eXakjY9Iv0NxZDAgq_mgbj8SAP_nHNIAe7wZue0Nmp6fDzdSl318N9xdvwj4Yeq8',
      gallery: [
        { title: 'Concealed LED strip lighting', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSlVNm3bhLWBv4knbPMshpC0z6XDbCFHO9owIwla9r13zDyShNaVeE-6_SV5oOIus3Cv-E8e4_PrNq7vOIzw5rUB0yeL5janUJd5hf3iFGQRMuB87CEt72e-FOdn_hVetda96_-HFtpknnr2Yh5m7-rlh9txcmU0X8cZjac4KfWkX0iTyq-5PMDqRBsFBGaEWN-UO3g3JU71qGhooDGtBY6u8-NHtsoNyy7x53jqBr-HLdaitF7Jv' }
      ],
      tags: ['Commercial Wiring', 'Generator Changeover', 'Concealed Wiring', 'Appliance Hookup'],
      bio: 'Certified residential electrician specializing in rapid fault diagnosis, generator manual/auto changeover switches, and kitchen appliances installation.',
      workingHours: '9:00 AM - 11:00 PM',
      services: [
        { name: 'Generator Changeover Switch Installation', price: 'Rs. 2,500', desc: 'Safe interlock mechanism to prevent grid back-feed.' },
        { name: 'Complete Room Rewiring', price: 'Rs. 4,000', desc: 'High load wiring with Pakistan Cables 7/29 copper wire.' }
      ],
      reviews: [
        { author: 'Faraz Ahmed', rating: 5, date: '3 days ago', area: 'Clifton Block 2', text: 'Arrived on his motorbike with all necessary testing meters. Solved generator backflow issue seamlessly.' }
      ]
    },
    {
      id: 'karachi-power-solutions',
      name: 'Engr. Shahzaib & Team',
      businessName: 'Karachi Power Solutions & Electric Works',
      category: 'electrician',
      type: 'shop',
      verified: true,
      urgentReady: false,
      district: 'gulshan',
      locality: 'Gulshan-e-Iqbal Block 13-D',
      phone: '+92 321 8234567',
      whatsapp: '923218234567',
      rating: 4.7,
      reviewsCount: 165,
      experienceYears: 16,
      jobsCompleted: 1420,
      responseTime: '~30 mins',
      rateStarting: 'Rs. 1,200',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtfHo2KZurspQzkZ2IsTTUBsCdxqrK5NxcMB5z0g9KPhIAnhkQr87UVzNOXMqExFFNOEBt5nC0ffqYril0LjABJ0e-eV9YapZPQBthjT24AyZxv_W1pj99Us3x1KMF_E3c_MgLDUwHnJkoPy-Lw_e0Ns4sl5Jg6u4dncTQTI9ZMBlNw6csjVXfAj-uxqwXlZ7qNcH6n5upSw-FQi0sQNbffBHMmKq49kWLaBj5rhfiZABooy0GnowJ',
      gallery: [
        { title: 'Commercial Panel Board Installation', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2l4P0wqkni4JXap4ad5Xf4HBbfy1jyDHX3FUdMUrFo0396vlt_xfNg48P99hWFZE-TfWOW8xbOZ9wTZBmkBIz6h6b3dlmcr_B_dxRSiddrF71x29Ia7h2L7mo-1vBv2CzpQwSr_h5VXoM-AFpvpuUudH-fkzbk01Jf_tEy8wB3_C_mYqB23LbrEJlKaJ_qIeVMnySPeESilDDoyKX3XwKFzWuhJSG2QGH2NRvAqye0WBFQ9LEBL63' }
      ],
      tags: ['Solar Inverter Setup', 'Sub-metering', 'Building Wiring', 'Appliance Servicing'],
      bio: 'Full service agency based in Gulshan. Team of 6 licensed electricians catering to commercial plazas, multi-unit houses, and solar system integrations.',
      workingHours: '9:00 AM - 9:00 PM',
      services: [
        { name: 'Full Building Submeter Installation', price: 'Rs. 3,000 / meter', desc: 'Accurate billing submeter with certified seals.' },
        { name: 'Solar Hybrid Inverter Configuration', price: 'Rs. 6,000', desc: 'Net-metering inspection readiness and load shifting.' }
      ],
      reviews: [
        { author: 'Hasan Raza', rating: 4.8, date: '2 weeks ago', area: 'Gulshan Block 6', text: 'Honest team. They advised us not to change the inverter and instead repaired a burnt contactor, saving Rs 25,000.' }
      ]
    },
    {
      id: 'master-plumber-saleem',
      name: 'Saleem Akhtar',
      businessName: 'Saleem Sanitary & Plumbing',
      category: 'plumber',
      type: 'individual',
      verified: true,
      urgentReady: true,
      district: 'pechs',
      locality: 'PECHS Block 2 near Tariq Road',
      phone: '+92 334 3198765',
      whatsapp: '923343198765',
      rating: 4.9,
      reviewsCount: 110,
      experienceYears: 12,
      jobsCompleted: 670,
      responseTime: '~15 mins',
      rateStarting: 'Rs. 1,000',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4AzipZE5x54eTvTk6U_Nuld4aVm8bttEj_sypX_08gahKrurGREYPQ1YUp9ZowjJOLXrIMXABFDs4LwY2S5BaWs7NO61I6Y7ymgJdnm0setiMWhpfzRtcQagtc_2TjPhjsMSTOKBg-tjTpW9M9B_8r3IRGiE7_duBwL7sIcQim_8A83vtP0MnVErrKsZT7AIRl_AY6t5hP-A5IvJUF4QRZfEAhAsHdwtN2mPcAYvgQq_il2vuzoVx',
      gallery: [
        { title: 'Concealed PPRC Water Line Work', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh_sRw3hmV3-7S4eNUd-jVO6bSyp0hVjmvJnXG1oQgcAzN4VP_eIJmZkl_MPu4cn6bdK2L8vqRh-o3t5WJiZO5TxWY_sqrtZ3IEN0Z--_cgbhxjNDSjvWO-GU0eiTs0MbgHl_RKimCrBYqcVeAFD5itfUXN0BPc3h_RqJ7QxAG6T4a8tmK_zj2jjST6iDrmQLd7bRv5r8IvN6HyGLW7O7OZgikD5SLl5PGm5qg8hoKu1pyQ2C9_2vX' }
      ],
      tags: ['Water Motor Repair', 'Underground Line Leak', 'Bathroom Mixer Fitting', 'Tank Level Valve'],
      bio: 'Expert sanitary technician for Karachi water pressure and pumping problems. Specializes in Donky pump / submersible installation and concealed leak detection.',
      workingHours: '8:00 AM - 10:00 PM',
      services: [
        { name: 'Water Pumping Motor Troubleshooting', price: 'Rs. 1,200', desc: 'Capacitor replacement, suction leak test & priming.' },
        { name: 'Automatic Tank Float Switch Installation', price: 'Rs. 1,500', desc: 'Prevents water overflow from roof tank automatically.' }
      ],
      reviews: [
        { author: 'Mrs. Mansoor', rating: 5, date: '4 days ago', area: 'PECHS Block 3', text: 'Our tank was overflowing every day. Saleem bhai fitted an automatic sensor and rewired the motor nicely. Very satisfied!' }
      ]
    },
    {
      id: 'karachi-cooling-expert',
      name: 'Muhammad Rashid',
      businessName: 'Rashid Inverter AC Service & Repair',
      category: 'ac',
      type: 'individual',
      verified: true,
      urgentReady: true,
      district: 'north-nazimabad',
      locality: 'North Nazimabad Block H & Hydri',
      phone: '+92 301 2349811',
      whatsapp: '923012349811',
      rating: 4.8,
      reviewsCount: 142,
      experienceYears: 10,
      jobsCompleted: 890,
      responseTime: '~20 mins',
      rateStarting: 'Rs. 1,500',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDahkD_4FnolcsH23Eu1ovizQwNtkPo8LaH5qxVqfYv48IkIj6H8bNoD_B6OdHKBYD7SZ3psn_Y4zQDVfMe8_dc7jty6Gpfm59YFYFxQwL_9RGC9ZkTcNhDX9bKO6We3oNZCopF4cIbuNOh9E5ebmi84HxfA3L9s_Nqx477jIDEu15unl8gdUICHojc3XPGuxolZtAZOD_bJYBxHudXCDVKVMHpyGbxkmS9tEerxSW9EkZjBzqxNZC',
      gallery: [
        { title: 'Pressure jet wash servicing', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSlVNm3bhLWBv4knbPMshpC0z6XDbCFHO9owIwla9r13zDyShNaVeE-6_SV5oOIus3Cv-E8e4_PrNq7vOIzw5rUB0yeL5janUJd5hf3iFGQRMuB87CEt72e-FOdn_hVetda96_-HFtpknnr2Yh5m7-rlh9txcmU0X8cZjac4KfWkX0iTyq-5PMDqRBsFBGaEWN-UO3g3JU71qGhooDGtBY6u8-NHtsoNyy7x53jqBr-HLdaitF7Jv' }
      ],
      tags: ['Inverter PCB Repair', 'Pressure Wash Master', 'Gas Charging R410A/R32', 'AC Relocation'],
      bio: 'Inverter AC specialist. Equipped with digital pressure gauges and specialized master wash kit that does not make a mess in your bedroom.',
      workingHours: '8:30 AM - 11:00 PM',
      services: [
        { name: 'Master Pressure Jet Chemical Service', price: 'Rs. 2,000', desc: 'Indoor coil deep clean, outdoor condenser jet wash & drain unclog.' },
        { name: 'Inverter PCB Board Diagnostics', price: 'Rs. 2,500', desc: 'Error code diagnosis (E6, F1, etc.) and circuit board fix.' }
      ],
      reviews: [
        { author: 'Omair Siddiqui', rating: 5, date: 'Yesterday', area: 'North Nazimabad', text: 'My DC inverter AC was not cooling. Rashid checked with meter, fixed capacitor on spot without falsely claiming gas leak.' }
      ]
    },
    {
      id: 'dha-home-chef-fatima',
      name: 'Chef Fatima Tariq',
      businessName: 'Ghar Ka Zaiqa - Home Kitchen & Daawat Catering',
      category: 'chef',
      type: 'individual',
      verified: true,
      urgentReady: false,
      district: 'dha-clifton',
      locality: 'DHA Phase 2 & Phase 7 Extension',
      phone: '+92 332 5567890',
      whatsapp: '923325567890',
      rating: 5.0,
      reviewsCount: 88,
      experienceYears: 8,
      jobsCompleted: 340,
      responseTime: '~30 mins',
      rateStarting: 'Rs. 2,500',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4AzipZE5x54eTvTk6U_Nuld4aVm8bttEj_sypX_08gahKrurGREYPQ1YUp9ZowjJOLXrIMXABFDs4LwY2S5BaWs7NO61I6Y7ymgJdnm0setiMWhpfzRtcQagtc_2TjPhjsMSTOKBg-tjTpW9M9B_8r3IRGiE7_duBwL7sIcQim_8A83vtP0MnVErrKsZT7AIRl_AY6t5hP-A5IvJUF4QRZfEAhAsHdwtN2mPcAYvgQq_il2vuzoVx',
      gallery: [],
      tags: ['Authentic Karachi Biryani', 'Hygienic Home Cooking', 'Daily Office Tiffin', 'Small Daawat Menu'],
      bio: 'Certified hygienic home chef serving authentic Karachi flavors. Fresh ingredients, olive/canola oil options, prepared with strict cleanliness.',
      workingHours: '10:00 AM - 8:00 PM',
      services: [
        { name: 'Karachi Beef/Chicken Daawat Biryani (5kg)', price: 'Rs. 6,500', desc: 'Pure basmati rice with sella aroma and raita / salad.' },
        { name: 'Monthly Home Meal Subscription', price: 'Rs. 18,000 / month', desc: 'Lunch/dinner rotation with rotis, salan & fresh lentils.' }
      ],
      reviews: [
        { author: 'Zubair Sheikh', rating: 5, date: '3 days ago', area: 'DHA Phase 2', text: 'Ordered 10 persons Daawat Biryani & Qorma. Food arrived hot and flavorful, all guests praised it!' }
      ]
    }
  ],

  blogs: [
    {
      id: 'monsoon-electrical-safety',
      title: '5 Essential Electrical Safety Checks for Karachi Homes Before Monsoon',
      category: 'Electrical Guide',
      categoryColor: 'bg-emerald-700',
      readTime: '4 min read',
      date: 'Oct 2026',
      author: 'Baseera Technical Advisory',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNOMtbJSY82AKQWGQkb45a1OheetogBy0KmLxDYJzcCBhH8PrgjE0NxEx3IcQ3Q0W_gmx47dq30UwGGamyMex6Vp24QDu7D-fGIYmY9T-SllMTYKozS6qCm8pruyd6CpFmJAm2eMEhhD1aRLbbinb8TaXdxSrb2AJ1dYZKvspDQQBKasc0XyPrXZDuKflThRBL9oP27wukRJHYdSnKWvTFnviRw06DXOSpej0CwLs5DX_Ju3Qlp2y6',
      summary: 'Prevent short circuits, dangerous neutral leakages, and appliance burnout during heavy rain spells with these straightforward preventative checks verified by licensed municipal wiremen.',
      content: `
        <p class="mb-4">Karachi monsoons bring severe voltage swings, underground cable dampness, and neutral breakdown issues. Before the downpour begins, taking these practical steps can save your expensive household electronics and ensure family safety.</p>
        <h3 class="font-bold text-lg text-gray-900 mt-6 mb-2">1. Check Earthing (Earth Pit Resistance)</h3>
        <p class="mb-4">Most older homes in Gulshan, PECHS and Federal B Area suffer from disconnected or corroded copper ground rods. Have an electrician test with an earth tester. Earth leakage circuit breakers (RCCB/ELCB) will not trip if ground resistance is too high.</p>
        <h3 class="font-bold text-lg text-gray-900 mt-6 mb-2">2. Install a Surge & Voltage Protector for ACs and Fridges</h3>
        <p class="mb-4">Frequent load-shedding accompanied by 280V+ spikes when electricity restores is common. Inverter AC PCBs can blow out instantly. Ensure every heavy appliance has a delay timer switch (minimum 3 minutes delay).</p>
        <h3 class="font-bold text-lg text-gray-900 mt-6 mb-2">3. Seal Rooftop Conduit Pipes</h3>
        <p class="mb-4">Water seeping through unsealed rooftop pipes trickles straight into switchboards. Apply silicone sealant around conduit entry points.</p>
      `
    },
    {
      id: 'solar-inverter-maintenance-karachi',
      title: 'Maximizing Solar Inverter Efficiency During Karachi Humid Summers',
      category: 'Solar & Energy',
      categoryColor: 'bg-amber-700',
      readTime: '3 min read',
      date: 'Oct 2026',
      author: 'Baseera Energy Wing',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2l4P0wqkni4JXap4ad5Xf4HBbfy1jyDHX3FUdMUrFo0396vlt_xfNg48P99hWFZE-TfWOW8xbOZ9wTZBmkBIz6h6b3dlmcr_B_dxRSiddrF71x29Ia7h2L7mo-1vBv2CzpQwSr_h5VXoM-AFpvpuUudH-fkzbk01Jf_tEy8wB3_C_mYqB23LbrEJlKaJ_qIeVMnySPeESilDDoyKX3XwKFzWuhJSG2QGH2NRvAqye0WBFQ9LEBL63',
      summary: 'Dust storms and coastal saline humidity in Clifton and DHA degrade solar panel yield by up to 28%. Here is how verified technicians recommend maintaining your panels.',
      content: `
        <p class="mb-4">Karachi coastal climate presents unique challenges for rooftop photovoltaic systems. Salt deposit and sand accumulation require regular cleaning cycles.</p>
        <h3 class="font-bold text-lg text-gray-900 mt-6 mb-2">Cleaning Time Matters</h3>
        <p class="mb-4">Never wash solar panels under direct midday sunlight. Thermal shock can crack the tempered solar glass. Always clean before 7:00 AM or after 6:00 PM.</p>
      `
    }
  ]
};

// Expose globally
window.BASEERA_DATA = BASEERA_DATA;
