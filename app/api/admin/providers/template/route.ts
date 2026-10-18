import { NextResponse } from 'next/server';

export async function GET() {
  const csvContent = [
    'fullName,whatsappNumber,categorySlug,citySlug,countrySlug,tradeTitle,shortBio,profileType,startingPrice,serviceArea',
    'Muhammad Tariq,+923001234567,electrician,karachi,pk,Master Residential & Solar Electrician,15+ years experience in domestic and commercial electrical repairs.,individual,800,"PECHS, Clifton, DHA"',
    'Ahmed Al-Mansoor,+971501234567,ac-technician,dubai,ae,Certified Chiller & Inverter AC Specialist,24/7 emergency central and split AC repair across Dubai.,shop,150,"Deira, Downtown Dubai, Business Bay"',
    'Rashid Khan,+966501234567,plumber,riyadh,sa,Emergency Plumbing & Leak Detection Specialist,Residential sanitary fittings water pumps and drainage clearing.,individual,100,"Al-Olaya, Al-Malaz, Al-Sulaimaniyah"',
    'Carlos Mendez,+525512345678,carpenter,mexico-city,mx,Maestro Carpintero & Modular Furniture,Custom kitchen cabinets solid wood doors and interior finishes.,individual,350,"Roma Norte, Condesa, Polanco"',
    'Lucas Silva,+5511987654321,painter,sao-paulo,br,Pintor Profissional & Texturas Decorativas,Residential and commercial painting damp-proofing and decorative textures.,individual,200,"Pinheiros, Vila Madalena, Jardins"',
  ].join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="baseera_providers_template.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
