export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  authorId: string;
  authorSlug: string;
  authorName: string;
  date: string;
  publishedAt: string;
  readTime: string;
  image: string;
  relatedCategorySlugs: string[];
  featuredCitySlugs: string[];
  content: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'ac-inverter-pcb-short-circuit-prevention',
    title: 'How to Prevent AC Inverter PCB Short Circuits in Summer Heatwaves',
    excerpt:
      'Surge voltages, high ambient temperatures, and improper neutral grounding destroy thousands of inverter cards every June. Here is the technician-approved checklist to safeguard your cooling units.',
    category: 'AC Maintenance',
    authorId: 'author-engr-tariq-mahmood',
    authorSlug: 'engr-tariq-mahmood',
    authorName: 'Engr. Tariq Mahmood',
    date: 'October 12, 2026',
    publishedAt: '2026-10-12T08:00:00Z',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    relatedCategorySlugs: ['ac-technician', 'electrician', 'geyser-repair'],
    featuredCitySlugs: ['karachi', 'lahore', 'islamabad', 'rawalpindi'],
    content: `
<p>Modern DC inverter air conditioners are remarkably efficient, yet their sophisticated printed circuit boards (PCBs) remain exceptionally sensitive to extreme thermal strain and erratic voltage fluctuations. During intense summer heatwaves across South Asia and the Gulf, ambient rooftop temperatures frequently breach 48°C, forcing compressor heat sinks to operate at thermal saturation limits.</p>

<h3>1. High Neutral-to-Ground Voltage (Float Voltage)</h3>
<p>In residential colonies, an ungrounded neutral line can induce upwards of 35V to 70V between the neutral rail and earth ground. Inverter microcontrollers reference this differential to modulate the variable-speed compressor. When float voltage spikes, it immediately punches through the optical isolators, resulting in catastrophic PCB failure. Always have a certified local specialist audit your distribution box.</p>

<h3>2. The Necessity of Dedicated Solid-State Voltage Stabilizers</h3>
<p>While manufacturers market modern inverters as "low-voltage start," this feature only applies to compressor startup, NOT PCB surge protection. Connecting a dedicated digital servo stabilizer or micro-controlled surge suppressor ensures input voltages stay strictly clamped between 210V and 230V.</p>

<h3>3. Routine Coil Flushing and Thermal Paste Reapplication</h3>
<p>Dust buildup acts as an insulating blanket over the outdoor unit's power transistors (IGBTs). Scheduling a seasonal chemical pressure wash with an experienced HVAC professional prevents premature heat shutdowns and extends the operating lifespan of expensive DC components.</p>
`,
  },
  {
    id: 'post-2',
    slug: 'underground-water-leak-detection',
    title: 'Underground Water Line Leak Detection Without Breaking Tiles',
    excerpt:
      'Modern acoustic detectors and thermal sensors allow master plumbers to pinpoint hidden pipe fractures before demolishing costly bathroom floors.',
    category: 'Plumbing Guide',
    authorId: 'author-saleem-akhtar',
    authorSlug: 'saleem-akhtar',
    authorName: 'Saleem Akhtar',
    date: 'October 08, 2026',
    publishedAt: '2026-10-08T09:30:00Z',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    relatedCategorySlugs: ['plumber', 'water-pump-repair', 'water-tank-cleaning'],
    featuredCitySlugs: ['karachi', 'lahore', 'islamabad'],
    content: `
<p>Hidden water leakages beneath marble slabs or reinforced bathroom concrete slabs represent one of the most frustrating maintenance headaches for property owners. In the past, locating a cracked PPRC elbow required tearing up entire floor sections on guesswork. Modern non-invasive acoustic diagnostics have eliminated this destructive cycle.</p>

<h3>Acoustic Rods and Correlation Microphones</h3>
<p>Pressurized water escaping through hairline fissures creates high-frequency micro-vibrations in surrounding piping material. Specialist plumbers utilize ground microphones and digital frequency correlators to isolate the distinct sound signature of turbulent water flow, locating faults within an accuracy of two inches.</p>

<h3>Thermal Imaging for Concealed Hot & Cold Conduits</h3>
<p>By circulating elevated temperature water through the domestic distribution network and capturing the wall with an infrared thermographic camera, hidden leaks appear as pronounced heat plumes spreading along structural masonry.</p>
`,
  },
  {
    id: 'post-3',
    slug: 'solar-inverter-db-breaker-sizing',
    title: 'Solar Inverter DB Breaker Sizing: Single Phase vs 3-Phase',
    excerpt:
      'Avoid nuisance breaker tripping during high solar generation peaks by correctly balancing loads across dedicated distribution panels.',
    category: 'Solar & Electrical',
    authorId: 'author-engr-tariq-mahmood',
    authorSlug: 'engr-tariq-mahmood',
    authorName: 'Engr. Tariq Mahmood',
    date: 'October 04, 2026',
    publishedAt: '2026-10-04T10:15:00Z',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    relatedCategorySlugs: ['solar-installer', 'electrician', 'ups-inverter-technician'],
    featuredCitySlugs: ['karachi', 'lahore', 'islamabad', 'faisalabad'],
    content: `
<p>As residential grid-tied and hybrid rooftop solar installations accelerate, improper breaker selection in the main AC distribution box (DB) remains the number one source of unprovoked tripping during midday irradiance peaks.</p>

<h3>Calculating Nominal Current vs Breaker Rating</h3>
<p>For a standard 10kW three-phase inverter, the maximum full-power output per phase is calculated as 10,000 / (3 * 230) ≈ 14.5 Amps per phase. Inverters frequently experience instantaneous surge peaks up to 125% of rated capacity. Installing an undersized 16A Type-B breaker will cause nuisance trips during cloud-edge magnification effects. A certified electrical installer will always rate the breaker at 1.25x the inverter's maximum continuous AC output current using Type-C curves.</p>
`,
  },
  {
    id: 'post-4',
    slug: 'questions-to-ask-any-karigar',
    title: 'Top 5 Questions to Ask Any Karigar Before Work Commences',
    excerpt:
      'A practical framework for homeowners: validating parts warranties, establishing visiting fees, and testing safety switches on-site.',
    category: 'Consumer Advice',
    authorId: 'author-baseera-editorial',
    authorSlug: 'baseera-editorial',
    authorName: 'Baseera Editorial Team',
    date: 'September 28, 2026',
    publishedAt: '2026-09-28T07:45:00Z',
    readTime: '3 min read',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    relatedCategorySlugs: ['electrician', 'plumber', 'mason', 'painter'],
    featuredCitySlugs: ['karachi', 'lahore', 'islamabad'],
    content: `
<p>Engaging independent tradespeople without a structured agreement frequently leads to misaligned expectations regarding material quality, diagnostic fees, and turnaround schedules. Here is the verified five-point checklist recommended by Baseera Editorial.</p>

<ol>
  <li><strong>Is the visiting charge inclusive of initial diagnostic work?</strong> Ensure you understand whether the diagnostic fee is credited against the total labor cost if you approve the quote.</li>
  <li><strong>Are replacement components genuine OEM parts with manufacturer receipts?</strong> Always request the original packaging and store warranty receipts for breakers, valves, and compressors.</li>
  <li><strong>What testing will be performed before handoff?</strong> For electrical work, insist on an insulation resistance test; for plumbing, request a 30-minute static pressure check.</li>
</ol>
`,
  },
  {
    id: 'post-5',
    slug: 'generator-vs-ups-running-cost',
    title: 'Gas Generator vs UPS Hybrid Inverter: Real Running Costs Compared',
    excerpt:
      'With fuel price fluctuations, calculate the true hourly cost per kilowatt hour between battery storage systems and portable gas gensets.',
    category: 'Power Backup',
    authorId: 'author-baseera-editorial',
    authorSlug: 'baseera-editorial',
    authorName: 'Baseera Editorial Team',
    date: 'September 21, 2026',
    publishedAt: '2026-09-21T11:00:00Z',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    relatedCategorySlugs: ['generator-repair', 'ups-inverter-technician', 'solar-installer'],
    featuredCitySlugs: ['karachi', 'lahore', 'rawalpindi'],
    content: `
<p>With utility tariff restructuring and localized load shedding schedules, determining the most economical backup power strategy requires balancing upfront capital expenditure against hourly fuel, battery degradation, and engine servicing costs.</p>

<h3>The Hidden Cost of Genset Maintenance</h3>
<p>While a 5kVA portable gasoline or natural gas generator delivers raw kilowatt capacity, engine oil degradation, carburetor cleaning, and spark plug replacements every 100 operating hours significantly increase its effective cost per unit compared to modern lithium iron phosphate (LiFePO4) inverter setups.</p>
`,
  },
  {
    id: 'post-6',
    slug: 'preventing-damp-walls-after-monsoon',
    title: 'Preventing Damp Walls and Paint Peeling After Monsoon Rains',
    excerpt:
      'Why standard emulsion paint fails on damp boundary walls, and how multi-coat polymer elastomeric sealers preserve interior aesthetics.',
    category: 'Home Renovation',
    authorId: 'author-baseera-editorial',
    authorSlug: 'baseera-editorial',
    authorName: 'Baseera Editorial Team',
    date: 'September 15, 2026',
    publishedAt: '2026-09-15T08:30:00Z',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    relatedCategorySlugs: ['painter', 'mason', 'water-tank-cleaning'],
    featuredCitySlugs: ['karachi', 'lahore', 'islamabad'],
    content: `
<p>Capillary dampness rising through brick foundations destroys standard decorative wall paint within weeks of heavy monsoon rains. Understanding how efflorescence salt crystals push paint off plaster is the first step toward lasting remedial repair.</p>

<h3>Moisture Barrier Injections and Breathable Primers</h3>
<p>Before applying topcoat finishes, the moisture reading within the masonry must be measured with a pinless hygrometer. Certified painting specialists apply elastomeric primers that create a flexible, breathable membrane impervious to hydrostatic pressure.</p>
`,
  },
  {
    id: 'post-7',
    slug: 'cctv-ip-camera-local-storage-guide',
    title: 'CCTV IP Camera Setup: Avoiding Cloud Subscription Traps',
    excerpt:
      'How local NVR storage combined with end-to-end encrypted mobile apps saves thousands in monthly cloud storage fees.',
    category: 'Security Tech',
    authorId: 'author-baseera-editorial',
    authorSlug: 'baseera-editorial',
    authorName: 'Baseera Editorial Team',
    date: 'September 10, 2026',
    publishedAt: '2026-09-10T12:00:00Z',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
    relatedCategorySlugs: ['cctv-technician', 'electrician'],
    featuredCitySlugs: ['karachi', 'lahore', 'islamabad'],
    content: `
<p>Home surveillance camera brands increasingly steer consumers toward monthly subscription cloud plans for video retention. For a standard 4-camera 4K setup, cloud storage fees can quickly surpass the initial cost of the hardware itself within 18 months.</p>

<h3>Local Network Video Recorders (NVR) with Surveillance HDDs</h3>
<p>Investing in a dedicated on-premises NVR with continuous 24/7 surveillance-grade hard drives provides full 30-day retention without recurring fees. Professional CCTV technicians configure secure peer-to-peer (P2P) remote viewing tunnels so homeowners can stream live feeds directly without exposing open ports to the public internet.</p>
`,
  },
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  return [...BLOG_POSTS];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug || typeof slug !== 'string') return null;
  const norm = slug.toLowerCase().trim();
  const match = BLOG_POSTS.find((p) => p.slug.toLowerCase() === norm);
  return match || null;
}

export async function getBlogPostsByAuthorSlug(authorSlug: string): Promise<BlogPost[]> {
  if (!authorSlug || typeof authorSlug !== 'string') return [];
  const norm = authorSlug.toLowerCase().trim();
  return BLOG_POSTS.filter((p) => p.authorSlug.toLowerCase() === norm);
}
