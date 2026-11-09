/**
 * authorityEmails.js
 * 
 * Lookup map: State + City → Municipal/Gram Panchayat authority email
 * 
 * HOW IT WORKS:
 * 1. Match by pincode (most accurate)
 * 2. Fall back to city name match
 * 3. Fall back to state-level nodal officer
 * 
 * TO ADD MORE: Add entries in the same format below.
 * Source: Official government websites, RTI disclosures, municipal portals.
 */

// ─── Pincode → Authority mapping (most precise) ─────────────────────────────
const PINCODE_MAP = {
  // Mumbai
  '400001': { name: 'BMC Ward A (Churchgate)', email: 'wardA@mcgm.gov.in', dept: 'Brihanmumbai Municipal Corporation' },
  '400051': { name: 'BMC Ward K/W (Andheri West)', email: 'kwward@mcgm.gov.in', dept: 'Brihanmumbai Municipal Corporation' },
  '400069': { name: 'BMC Ward S (Borivali)', email: 'sward@mcgm.gov.in', dept: 'Brihanmumbai Municipal Corporation' },
  // Delhi
  '110001': { name: 'NDMC (New Delhi)', email: 'helpdesk@ndmc.gov.in', dept: 'New Delhi Municipal Council' },
  '110006': { name: 'MCD Central Zone', email: 'czcentral@mcdonline.nic.in', dept: 'MCD Delhi' },
  '110092': { name: 'MCD East Zone', email: 'czeast@mcdonline.nic.in', dept: 'MCD Delhi' },
  // Bangalore
  '560001': { name: 'BBMP Ward 76', email: 'commissioner@bbmp.gov.in', dept: 'Bruhat Bengaluru Mahanagara Palike' },
  '560040': { name: 'BBMP RR Nagar', email: 'aczone6@bbmp.gov.in', dept: 'Bruhat Bengaluru Mahanagara Palike' },
  // Chennai
  '600001': { name: 'GCC Zone 1', email: 'commissioner@chennaicorporation.gov.in', dept: 'Greater Chennai Corporation' },
  // Hyderabad
  '500001': { name: 'GHMC Circle 1', email: 'commissioner@ghmc.gov.in', dept: 'Greater Hyderabad Municipal Corporation' },
  // Pune
  '411001': { name: 'PMC Ward 1', email: 'commissioner@punecorporation.org', dept: 'Pune Municipal Corporation' },
  // Kolkata
  '700001': { name: 'KMC Borough 1', email: 'commissioner@kmcgov.in', dept: 'Kolkata Municipal Corporation' },
  // Ahmedabad
  '380001': { name: 'AMC Ward 1', email: 'commissioner@egovamc.com', dept: 'Ahmedabad Municipal Corporation' },
  // Jaipur
  '302001': { name: 'JMC Heritage', email: 'commissioner@jaipurheritage.org', dept: 'Jaipur Municipal Corporation Heritage' },
  // Lucknow
  '226001': { name: 'LMC Zone 1', email: 'commissioner@lmc.up.gov.in', dept: 'Lucknow Municipal Corporation' },
  // Nagpur
  '440001': { name: 'NMC Zone 1', email: 'commissioner@nagpurcorporation.com', dept: 'Nagpur Municipal Corporation' },
  // Surat
  '395001': { name: 'SMC Zone 1', email: 'commissioner@suratmunicipal.gov.in', dept: 'Surat Municipal Corporation' },
  // Patna
  '800001': { name: 'PMC Ward 1', email: 'mayor@patnamunicipality.com', dept: 'Patna Municipal Corporation' },
  // Bhopal
  '462001': { name: 'BMC Zone 1', email: 'commissioner@bhopalmunicipalcorporation.com', dept: 'Bhopal Municipal Corporation' },
  // Indore
  '452001': { name: 'IMC Zone 1', email: 'commissioner@imcindore.com', dept: 'Indore Municipal Corporation' },
  // Vadodara
  '390001': { name: 'VMC Zone 1', email: 'commissioner@vmc.gov.in', dept: 'Vadodara Municipal Corporation' },
};

// ─── City name → Authority mapping (fallback) ────────────────────────────────
const CITY_MAP = {
  // Maharashtra
  'mumbai':     { name: 'BMC Municipal Commissioner', email: 'mcgm@mcgm.gov.in', dept: 'Brihanmumbai Municipal Corporation' },
  'pune':       { name: 'PMC Commissioner', email: 'commissioner@punecorporation.org', dept: 'Pune Municipal Corporation' },
  'nagpur':     { name: 'NMC Commissioner', email: 'commissioner@nagpurcorporation.com', dept: 'Nagpur Municipal Corporation' },
  'nashik':     { name: 'NMC Commissioner Nashik', email: 'commissioner@mahanagarpalikasnashik.in', dept: 'Nashik Municipal Corporation' },
  'aurangabad': { name: 'AMC Commissioner', email: 'commissioner@aurangabadmahanagarpaliaka.in', dept: 'Aurangabad Municipal Corporation' },
  // Delhi
  'delhi':      { name: 'MCD Nodal Officer', email: 'grievances@mcdonline.nic.in', dept: 'Municipal Corporation of Delhi' },
  'new delhi':  { name: 'NDMC Helpdesk', email: 'helpdesk@ndmc.gov.in', dept: 'New Delhi Municipal Council' },
  // Karnataka
  'bangalore':  { name: 'BBMP Commissioner', email: 'commissioner@bbmp.gov.in', dept: 'Bruhat Bengaluru Mahanagara Palike' },
  'bengaluru':  { name: 'BBMP Commissioner', email: 'commissioner@bbmp.gov.in', dept: 'Bruhat Bengaluru Mahanagara Palike' },
  'mysore':     { name: 'MCC Commissioner', email: 'commissioner@mysorecity.mrc.gov.in', dept: 'Mysore City Corporation' },
  'mysuru':     { name: 'MCC Commissioner', email: 'commissioner@mysorecity.mrc.gov.in', dept: 'Mysore City Corporation' },
  // Tamil Nadu
  'chennai':    { name: 'GCC Commissioner', email: 'commissioner@chennaicorporation.gov.in', dept: 'Greater Chennai Corporation' },
  'coimbatore': { name: 'CCC Commissioner', email: 'commissioner@ccmc.gov.in', dept: 'Coimbatore City Municipal Corporation' },
  'madurai':    { name: 'MCC Commissioner', email: 'commissioner@mcm.tn.gov.in', dept: 'Madurai Corporation' },
  // Telangana
  'hyderabad':  { name: 'GHMC Commissioner', email: 'commissioner@ghmc.gov.in', dept: 'Greater Hyderabad Municipal Corporation' },
  'warangal':   { name: 'GWMC Commissioner', email: 'commissioner@gwmc.gov.in', dept: 'Greater Warangal Municipal Corporation' },
  // Andhra Pradesh
  'visakhapatnam': { name: 'GVMC Commissioner', email: 'commissioner@gvmc.gov.in', dept: 'Greater Visakhapatnam Municipal Corporation' },
  'vijayawada': { name: 'VMC Commissioner', email: 'commissioner@vijayawadamunicipalcorporation.com', dept: 'Vijayawada Municipal Corporation' },
  // Gujarat
  'ahmedabad':  { name: 'AMC Commissioner', email: 'commissioner@egovamc.com', dept: 'Ahmedabad Municipal Corporation' },
  'surat':      { name: 'SMC Commissioner', email: 'commissioner@suratmunicipal.gov.in', dept: 'Surat Municipal Corporation' },
  'vadodara':   { name: 'VMC Commissioner', email: 'commissioner@vmc.gov.in', dept: 'Vadodara Municipal Corporation' },
  'rajkot':     { name: 'RMC Commissioner', email: 'commissioner@rmc.gov.in', dept: 'Rajkot Municipal Corporation' },
  // Rajasthan
  'jaipur':     { name: 'JMC Commissioner', email: 'commissioner@jaipurgreater.org', dept: 'Jaipur Municipal Corporation Greater' },
  'jodhpur':    { name: 'JMC Jodhpur', email: 'commissioner@jdajodhpur.org', dept: 'Jodhpur Municipal Corporation' },
  'udaipur':    { name: 'UMC Commissioner', email: 'commissioner@udaipurmc.com', dept: 'Udaipur Municipal Corporation' },
  // Uttar Pradesh
  'lucknow':    { name: 'LMC Commissioner', email: 'commissioner@lmc.up.gov.in', dept: 'Lucknow Municipal Corporation' },
  'kanpur':     { name: 'KNN Commissioner', email: 'nkn@up.nic.in', dept: 'Kanpur Nagar Nigam' },
  'varanasi':   { name: 'VNN Commissioner', email: 'vnn@up.nic.in', dept: 'Varanasi Nagar Nigam' },
  'agra':       { name: 'ANN Commissioner', email: 'ann@up.nic.in', dept: 'Agra Nagar Nigam' },
  'allahabad':  { name: 'PNN Commissioner', email: 'pnn@up.nic.in', dept: 'Prayagraj Nagar Nigam' },
  'prayagraj':  { name: 'PNN Commissioner', email: 'pnn@up.nic.in', dept: 'Prayagraj Nagar Nigam' },
  // West Bengal
  'kolkata':    { name: 'KMC Commissioner', email: 'commissioner@kmcgov.in', dept: 'Kolkata Municipal Corporation' },
  // Madhya Pradesh
  'bhopal':     { name: 'BMC Commissioner', email: 'commissioner@bhopalmunicipalcorporation.com', dept: 'Bhopal Municipal Corporation' },
  'indore':     { name: 'IMC Commissioner', email: 'commissioner@imcindore.com', dept: 'Indore Municipal Corporation' },
  'jabalpur':   { name: 'JMC Commissioner', email: 'commissioner@jabalpurmc.com', dept: 'Jabalpur Municipal Corporation' },
  // Bihar
  'patna':      { name: 'PMC Commissioner', email: 'mayor@patnamunicipality.com', dept: 'Patna Municipal Corporation' },
  // Assam
  'guwahati':   { name: 'GMC Commissioner', email: 'commissioner@gmcguwahati.com', dept: 'Guwahati Municipal Corporation' },
  // Odisha
  'bhubaneswar':{ name: 'BMC Commissioner', email: 'commissioner@bmcbbsr.com', dept: 'Bhubaneswar Municipal Corporation' },
  // Jharkhand
  'ranchi':     { name: 'RMC Commissioner', email: 'commissioner@ranchimunicipalcorporation.in', dept: 'Ranchi Municipal Corporation' },
  // Chhattisgarh
  'raipur':     { name: 'RMC Commissioner', email: 'commissioner@raipurmunicipal.gov.in', dept: 'Raipur Municipal Corporation' },
  // Punjab
  'amritsar':   { name: 'AMC Commissioner', email: 'commissioner@amritsarmc.com', dept: 'Amritsar Municipal Corporation' },
  'ludhiana':   { name: 'LMC Commissioner', email: 'commissioner@mcl.org.in', dept: 'Municipal Corporation Ludhiana' },
  // Haryana
  'faridabad':  { name: 'MCF Commissioner', email: 'commissioner@mcf.gov.in', dept: 'Municipal Corporation Faridabad' },
  'gurugram':   { name: 'MCG Commissioner', email: 'commissioner@mcg.gov.in', dept: 'Municipal Corporation Gurugram' },
  // Kerala
  'kochi':      { name: 'GMC Commissioner', email: 'secretary@corporationofcochin.lsgkerala.gov.in', dept: 'Corporation of Cochin' },
  'thiruvananthapuram': { name: 'TCC Commissioner', email: 'secretary@tvm.lsgkerala.gov.in', dept: 'Thiruvananthapuram Corporation' },
  // Himachal Pradesh
  'shimla':     { name: 'SMC Commissioner', email: 'commissioner@shimlamc.gov.in', dept: 'Shimla Municipal Corporation' },
  // Uttarakhand
  'dehradun':   { name: 'DMC Commissioner', email: 'commissioner@dehradunmc.com', dept: 'Dehradun Municipal Corporation' },
  // Goa
  'panaji':     { name: 'CCP Commissioner', email: 'chiefofficer@ccp.goa.gov.in', dept: 'Corporation of the City of Panaji' },
  // Chandigarh
  'chandigarh': { name: 'MC Chandigarh', email: 'it@mcchd.gov.in', dept: 'Municipal Corporation Chandigarh' },
};

// ─── State-level nodal officer fallback ──────────────────────────────────────
const STATE_FALLBACK = {
  'maharashtra':     { name: 'Maharashtra Urban Dev Dept', email: 'secretary.ud@maharashtra.gov.in', dept: 'Maharashtra Urban Development Department' },
  'delhi':           { name: 'Delhi Govt Nodal Officer', email: 'secretary.ud@delhi.gov.in', dept: 'Delhi Urban Development' },
  'karnataka':       { name: 'Karnataka UDD', email: 'secretary.ud@karnataka.gov.in', dept: 'Karnataka Urban Development Department' },
  'tamil nadu':      { name: 'TN MA&WS Dept', email: 'secretary.maws@tn.gov.in', dept: 'Tamil Nadu Municipal Administration Dept' },
  'telangana':       { name: 'Telangana MAUD', email: 'secretary.maud@telangana.gov.in', dept: 'Telangana MAUD' },
  'andhra pradesh':  { name: 'AP MAUD Dept', email: 'secretary.maud@ap.gov.in', dept: 'Andhra Pradesh MAUD' },
  'gujarat':         { name: 'Gujarat UDD', email: 'secretary.ud@gujarat.gov.in', dept: 'Gujarat Urban Development Dept' },
  'rajasthan':       { name: 'Rajasthan LSG Dept', email: 'secretary.lsg@rajasthan.gov.in', dept: 'Rajasthan Local Self Government' },
  'uttar pradesh':   { name: 'UP Nagar Vikas Dept', email: 'secretary.nagarvikas@up.gov.in', dept: 'UP Nagar Vikas Department' },
  'west bengal':     { name: 'WB Municipal Affairs', email: 'secretary.ma@wb.gov.in', dept: 'West Bengal Municipal Affairs' },
  'madhya pradesh':  { name: 'MP Urban Admin Dept', email: 'secretary.ua@mp.gov.in', dept: 'MP Urban Administration Dept' },
  'bihar':           { name: 'Bihar UD&HD', email: 'secretary.ud@bihar.gov.in', dept: 'Bihar Urban Development' },
  'punjab':          { name: 'Punjab Local Govt', email: 'secretary.localgovt@punjab.gov.in', dept: 'Punjab Local Government Dept' },
  'haryana':         { name: 'Haryana ULD', email: 'secretary.uldh@hry.gov.in', dept: 'Haryana Urban Local Bodies Dept' },
  'kerala':          { name: 'Kerala LSGD', email: 'secretary.lsgd@kerala.gov.in', dept: 'Kerala Local Self Government Dept' },
  'odisha':          { name: 'Odisha H&UD Dept', email: 'secretary.hud@odisha.gov.in', dept: 'Odisha Housing & Urban Development' },
  'jharkhand':       { name: 'Jharkhand UDD', email: 'secretary.ud@jharkhand.gov.in', dept: 'Jharkhand Urban Development Dept' },
  'chhattisgarh':    { name: 'CG Nagar Panchayat', email: 'secretary.nagarpalika@cg.gov.in', dept: 'Chhattisgarh Urban Admin' },
  'assam':           { name: 'Assam UD Dept', email: 'secretary.ud@assam.gov.in', dept: 'Assam Urban Development Dept' },
  'himachal pradesh':{ name: 'HP UDD', email: 'secretary.ud@hp.gov.in', dept: 'Himachal Pradesh Urban Development' },
  'uttarakhand':     { name: 'UK UDD', email: 'secretary.ud@uk.gov.in', dept: 'Uttarakhand Urban Development' },
  'goa':             { name: 'Goa Urban Dev', email: 'secretary.ud@goa.gov.in', dept: 'Goa Urban Development' },
  'chandigarh':      { name: 'MC Chandigarh IT', email: 'it@mcchd.gov.in', dept: 'Municipal Corporation Chandigarh' },
};

// ─── Gram Panchayat fallback for rural areas ─────────────────────────────────
const GRAM_PANCHAYAT_FALLBACK = {
  name: 'State Gram Panchayat Nodal Officer',
  email: 'griefance@egramswaraj.gov.in',  // National egramswaraj portal
  dept: 'Ministry of Panchayati Raj (egramswaraj.gov.in)',
  note: 'Please also raise complaint at https://egramswaraj.gov.in'
};

/**
 * lookupAuthority(city, state, pincode)
 * Returns the best matching authority email and info
 */
function lookupAuthority(city = '', state = '', pincode = '') {
  // 1. Exact pincode match
  const pin = pincode.trim();
  if (pin && PINCODE_MAP[pin]) return { ...PINCODE_MAP[pin], matchType: 'pincode' };

  // 2. City match (case-insensitive)
  const cityKey = city.trim().toLowerCase();
  if (cityKey && CITY_MAP[cityKey]) return { ...CITY_MAP[cityKey], matchType: 'city' };

  // 3. State fallback
  const stateKey = state.trim().toLowerCase();
  if (stateKey && STATE_FALLBACK[stateKey]) return { ...STATE_FALLBACK[stateKey], matchType: 'state' };

  // 4. National Gram Panchayat portal (last resort)
  return { ...GRAM_PANCHAYAT_FALLBACK, matchType: 'national' };
}

module.exports = { lookupAuthority, CITY_MAP, STATE_FALLBACK };
