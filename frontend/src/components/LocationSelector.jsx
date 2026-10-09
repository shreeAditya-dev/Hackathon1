import { useEffect, useState } from "react";

// Full state → district mapping from AgriSentinal's config/state_district.json
// Loaded dynamically from the API, with a compact built-in fallback.
const FALLBACK_DISTRICTS = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang", "West Siang", "East Siang", "Upper Siang", "Papum Pare", "Changlang", "Tirap", "Lohit"],
  "Assam": ["Baksa", "Barpeta", "Dibrugarh", "Golaghat", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Nagaon", "Sivasagar", "Sonitpur", "Tinsukia"],
  "Bihar": ["Araria", "Aurangabad", "Bhagalpur", "Darbhanga", "Gaya", "Muzaffarpur", "Nalanda", "Patna", "Purnia", "Rohtas", "Samastipur", "Vaishali"],
  "Chhattisgarh": ["Bastar", "Bilaspur", "Durg", "Jagdalpur", "Jashpur", "Korba", "Raigarh", "Raipur", "Rajnandgaon", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Bharuch", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Kutch", "Rajkot", "Surat", "Vadodara"],
  "Haryana": ["Ambala", "Faridabad", "Gurugram", "Hisar", "Karnal", "Panipat", "Rohtak", "Sonipat"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Dharamshala", "Kullu", "Mandi", "Shimla", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Dhanbad", "Giridih", "Hazaribagh", "Jamshedpur", "Khunti", "Ranchi"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru", "Chitradurga", "Davangere", "Dharwad", "Hassan", "Hubballi", "Kalaburagi", "Kodagu", "Kolar", "Mandya", "Mangaluru", "Mysuru", "Shivamogga", "Tumakuru", "Udupi"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kochi", "Kollam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thrissur", "Thiruvananthapuram", "Wayanad"],
  "Madhya Pradesh": ["Bhopal", "Chhindwara", "Dewas", "Gwalior", "Indore", "Jabalpur", "Khandwa", "Mandla", "Ratlam", "Rewa", "Sagar", "Satna", "Ujjain", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Dhule", "Jalgaon", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nashik", "Nanded", "Pune", "Sangli", "Satara", "Solapur"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Senapati", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "Ri Bhoi", "South Garo Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lunglei", "Mamit", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Phek", "Tuensang", "Wokha"],
  "Odisha": ["Angul", "Balasore", "Bargarh", "Bhubaneswar", "Bolangir", "Cuttack", "Dhenkanal", "Ganjam", "Jharsuguda", "Kalahandi", "Kendrapara", "Keonjhar", "Khurda", "Koraput", "Puri", "Rayagada", "Sambalpur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Pathankot", "Patiala", "Rupnagar", "Sangrur"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Chittorgarh", "Churu", "Dungarpur", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Kota", "Nagaur", "Pali", "Sikar", "Sirohi", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Karimnagar", "Khammam", "Medak", "Nalgonda", "Nizamabad", "Rangareddy", "Sangareddy", "Vikarabad", "Warangal", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ayodhya", "Azamgarh", "Bareilly", "Barabanki", "Budaun", "Bulandshahr", "Etah", "Etawah", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gorakhpur", "Hamirpur", "Hardoi", "Jhansi", "Kannauj", "Kanpur Nagar", "Kaushambi", "Lucknow", "Mathura", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Prayagraj", "Raebareli", "Saharanpur", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Kolkata", "Maldah", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Siliguri", "South 24 Parganas"],
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South West Delhi", "West Delhi"],
  "Jammu and Kashmir": ["Anantnag", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
};

function LocationSelector({ state, district, setState, setDistrict }) {
  const [districts, setDistricts] = useState(FALLBACK_DISTRICTS);
  const states = Object.keys(districts).sort();

  // Try to load richer district data from AgriSentinal's API
  useEffect(() => {
    fetch("/api/states")
      .then((r) => r.json())
      .then((json) => {
        if (json?.data && typeof json.data === "object") {
          setDistricts(json.data);
        }
      })
      .catch(() => {
        // Silently use fallback
      });
  }, []);

  return (
    <div className="grid gap-5 md:grid-cols-2">

      <div>
        <label className="mb-2 block text-sm text-gray-400">
          State
        </label>

        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setDistrict("");
          }}
          className="w-full rounded-2xl border border-white/10 bg-[#071711] px-4 py-4 text-sm text-white outline-none focus:border-emerald-400/50"
        >
          <option value="">Select State</option>

          {states.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-gray-400">
          District
        </label>

        <select
          value={district}
          disabled={!state}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#071711] px-4 py-4 text-sm text-white outline-none focus:border-emerald-400/50 disabled:opacity-40"
        >
          <option value="">Select District</option>

          {state &&
            districts[state]?.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </select>
      </div>

    </div>
  );
}

export default LocationSelector;