export const indianStates = [
  {
    name: "Andaman and Nicobar Islands",
    cities: ["Port Blair", "Diglipur", "Mayabunder"],
  },
  {
    name: "Andhra Pradesh",
    cities: [
      "Visakhapatnam",
      "Vijayawada",
      "Hyderabad",
      "Tirupati",
      "Nellore",
      "Kurnool",
    ],
  },
  {
    name: "Arunachal Pradesh",
    cities: ["Itanagar", "Pasighat", "Tezu", "Ziro"],
  },
  {
    name: "Assam",
    cities: [
      "Guwahati",
      "Dibrugarh",
      "Silchar",
      "Nagaon",
      "Barpeta",
      "Golaghat",
    ],
  },
  {
    name: "Bihar",
    cities: [
      "Patna",
      "Gaya",
      "Bhagalpur",
      "Muzaffarpur",
      "Darbhanga",
      "Arrah",
      "Madhubani",
    ],
  },
  {
    name: "Chandigarh",
    cities: ["Chandigarh"],
  },
  {
    name: "Chhattisgarh",
    cities: ["Raipur", "Bilaspur", "Durg", "Rajnandgaon", "Raigarh"],
  },
  {
    name: "Dadra and Nagar Haveli",
    cities: ["Silvassa", "Dadra"],
  },
  {
    name: "Daman and Diu",
    cities: ["Daman", "Diu"],
  },
  {
    name: "Delhi",
    cities: [
      "New Delhi",
      "Central Delhi",
      "East Delhi",
      "North Delhi",
      "South Delhi",
      "West Delhi",
    ],
  },
  {
    name: "Goa",
    cities: ["Panaji", "Margao", "Vasco da Gama", "Ponda"],
  },
  {
    name: "Gujarat",
    cities: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Bhavnagar",
      "Gandhinagar",
      "Junagadh",
    ],
  },
  {
    name: "Haryana",
    cities: ["Faridabad", "Gurgaon", "Hisar", "Rohtak", "Panipat", "Ambala"],
  },
  {
    name: "Himachal Pradesh",
    cities: ["Shimla", "Mandi", "Solan", "Kangra", "Kullu"],
  },
  {
    name: "Jharkhand",
    cities: ["Ranchi", "Dhanbad", "Giridih", "Jamshedpur", "Bokaro"],
  },
  {
    name: "Karnataka",
    cities: [
      "Bangalore",
      "Mysore",
      "Belgaum",
      "Mangalore",
      "Hubli",
      "Davangere",
    ],
  },
  {
    name: "Kerala",
    cities: [
      "Thiruvananthapuram",
      "Kochi",
      "Kozhikode",
      "Thrissur",
      "Kannur",
      "Kottayam",
    ],
  },
  {
    name: "Lakshadweep",
    cities: ["Kavaratti", "Agatti"],
  },
  {
    name: "Madhya Pradesh",
    cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Ratlam"],
  },
  {
    name: "Maharashtra",
    cities: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Thane",
      "Aurangabad",
      "Nashik",
      "Latur",
    ],
  },
  {
    name: "Manipur",
    cities: ["Imphal", "Bishnupur", "Ukhrul"],
  },
  {
    name: "Meghalaya",
    cities: ["Shillong", "Tura", "Jowai"],
  },
  {
    name: "Mizoram",
    cities: ["Aizawl", "Lunglei", "Saiha"],
  },
  {
    name: "Nagaland",
    cities: ["Kohima", "Dimapur", "Mokokchung"],
  },
  {
    name: "Odisha",
    cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Balasore", "Sambalpur"],
  },
  {
    name: "Puducherry",
    cities: ["Puducherry", "Yanam", "Mahe", "Karaikal"],
  },
  {
    name: "Punjab",
    cities: ["Chandigarh", "Ludhiana", "Amritsar", "Patiala", "Jalandhar"],
  },
  {
    name: "Rajasthan",
    cities: [
      "Jaipur",
      "Jodhpur",
      "Udaipur",
      "Ajmer",
      "Bikaner",
      "Kota",
      "Bhilwara",
    ],
  },
  {
    name: "Sikkim",
    cities: ["Gangtok", "Pelling", "Namchi"],
  },
  {
    name: "Tamil Nadu",
    cities: ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruppur", "Erode"],
  },
  {
    name: "Telangana",
    cities: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Suryapet"],
  },
  {
    name: "Tripura",
    cities: ["Agartala", "Udaipur", "Dharmanagar"],
  },
  {
    name: "Uttar Pradesh",
    cities: [
      "Lucknow",
      "Kanpur",
      "Agra",
      "Varanasi",
      "Meerut",
      "Ghaziabad",
      "Noida",
    ],
  },
  {
    name: "Uttarakhand",
    cities: ["Dehradun", "Haridwar", "Nainital", "Almora"],
  },
  {
    name: "West Bengal",
    cities: ["Kolkata", "Asansol", "Siliguri", "Darjeeling", "Jalpaiguri"],
  },
];

export const getStateByName = (name: string) => {
  return indianStates.find(
    (state) => state.name.toLowerCase() === name.toLowerCase()
  );
};

export const getCitiesByState = (stateName: string) => {
  const state = getStateByName(stateName);
  return state ? state.cities : [];
};
