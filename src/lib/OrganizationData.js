import { User, Users, Cpu, Zap, Activity, Laptop } from 'lucide-react';

export const organizationData = {
  id: "gm-sldc",
  name: "GM (SLDC)",
  level: "executive",
  icon: User,
  details: {
    name: "Sh. Anish Garg",
    designation: "General Manager (SLDC)",
    address: "State Load Despatch Centre\n33 KV Sub Station Building\nMinto Road\nNew Delhi-110 002",
    phone: "23221091/23216019",
    fax: "23221069/23221012/23221059",
    email: "gm.sosldc@dtl.gov.in, gmsldc@delhisldc.org",
    assistant: {
      name: "Sh. Sameer",
      designation: "AM(T) to GM(SLDC)",
      phone: "23221091/1069"
    }
  },
  children: [
    {
      id: "dgm-sldc",
      name: "DGM (SLDC)",
      level: "management",
      icon: Users,
      details: {
        name: "Sh. Vinay Kumar Jaiswal",
        designation: "AGM (SLDC)",
        address: "State Load Despatch Centre\n33 KV Sub Station Building\nMinto Road\nNew Delhi-110 002",
        phone: "23233877,22474787",
        email: "dgmsldc@delhisldc.org"
      },
      children: [
        {
          id: "manager-hardware",
          name: "Manager (Hardware)",
          level: "operational",
          icon: Laptop,
          details: {
            name: "Mr. Mukesh Kumar",
            designation: "Manager (Hardware)",
            address: "State Load Despatch Centre\n33 KV Sub Station Building\nMinto Road\nNew Delhi-110 002",
            phone: "23221046",
            email: "managerhw@delhisldc.org",
            team: [
              { name: "Ms. Geetanjali Tripathi", designation: "D.M.(T) (Hardware)", phone: "23221046" },
              { name: "Sh. Yogesh Verma", designation: "D.M.(T) (Hardware)", phone: "23221046" },
              { name: "Sh. Sahil Panthri", designation: "DM(T) (Hardware)", phone: "23221046" },
              { name: "Sh. Ankur Sharma", designation: "JE (Hardware)", phone: "23233695" },
              { name: "Sh. Virendra Kumar", designation: "JE (Hardware)", phone: "23233695" }
            ]
          }
        },
        {
          id: "manager-comm",
          name: "Manager (Comm.)",
          level: "operational",
          icon: Activity,
          details: {
            name: "Sh. Mukesh Kumar",
            designation: "Sr. Manager (Communications)",
            address: "State Load Despatch Centre\n33 KV Sub Station Building\nMinto Road\nNew Delhi-110 002",
            phone: "23221046",
            email: "managercomm@delhisldc.org",
            team: [
              { name: "Sh. Jitendra Sharma", designation: "D.M.(T) (Comm)", phone: "23221046" },
              { name: "Sh. Jaspal Singh", designation: "D.M.(T) (Comm)", phone: "23221046" },
              { name: "Sh. Shyam Tiwari", designation: "AM(T) (Comm)", phone: "23221046" },
              { name: "Sh. Virender Kumar", designation: "JE", phone: "23221046" },
              { name: "Sh. Vinod Kumar", designation: "JE", phone: "23221046" }
            ]
          }
        },
        {
          id: "manager-software",
          name: "Manager (Software)",
          level: "operational",
          icon: Cpu,
          details: {
            name: "Ms. Meghna Gill",
            designation: "Sr. Manager (Software)",
            address: "State Load Despatch Centre\n33 KV Sub Station Building\nMinto Road\nNew Delhi-110 002",
            phone: "23216823",
            email: "managersw@delhisldc.org",
            team: [
              { name: "Sh. Akhil Agrawal", designation: "D.M.(T) I (Software)", phone: "23216823", email: "amsoftware@delhisldc.org" },
              { name: "Sh. Pawan Verma", designation: "D.M.(T) II (Software)", phone: "23216823" },
              { name: "Sh. Rajesh Jaiswal", designation: "D.M.(T) III (Software)", phone: "23216823" },
              { name: "Sh. Kamlesh Verma", designation: "DM(T)-I Cyber Security", phone: "23216823" },
              { name: "Sh. Subodh Kumar", designation: "DM(T)-II Cyber Security", phone: "23216823" }
            ]
          }
        }
      ]
    },
    {
      id: "dgm-energy-accounting",
      name: "DGM (Energy Accounting)",
      level: "management",
      icon: Users,
      details: {
        name: "Sh. Kamlesh Dass",
        designation: "DGM (Energy Accounting)",
        address: "State Load Despatch Centre\n33 KV Sub Station Building\nMinto Road\nNew Delhi-110 002",
        phone: "23211207"
      },
      children: [
        {
          id: "manager-ea",
          name: "Manager (EA)",
          level: "operational",
          icon: Zap,
          details: {
            name: "Ms. Neelam Bharti",
            designation: "Manager (Energy Accounting)",
            address: "State Load Despatch Centre\n33 KV Sub Station Building\nMinto Road\nNew Delhi-110 002",
            phone: "23211207",
            team: [
              { name: "Sh. Deepak Sharma", designation: "D.M.(T)", phone: "23211207" },
              { name: "Sh. Pavan Revankar", designation: "D.M.(T)", phone: "23211207" },
              { name: "Sh. Y. K. Meena", designation: "D.M.(T)", phone: "23211207" },
              { name: "Sh. Ajeet Kumar", designation: "JE", phone: "23211207" }
            ]
          }
        }
      ]
    },
    {
      id: "dgm-so",
      name: "DGM (SO)",
      level: "management",
      icon: Users,
      details: {
        name: "Sh. S. K Sinha",
        designation: "AGM (System Operation)",
        address: "State Load Despatch Centre\n33 KV Sub Station Building\nMinto Road\nNew Delhi-110 002",
        phone: "23221175",
        email: "dgmso@delhisldc.org"
      },
      children: [
        {
          id: "manager-so-general",
          name: "Manager (SO General)",
          level: "operational",
          icon: Activity,
          details: {
            name: "Sh. Sanjeev Kumar",
            designation: "Manager (SO) G",
            address: "State Load Despatch Centre\n33 KV Sub Station Building\nMinto Road\nNew Delhi-110 002",
            phone: "23221175",
            team: [
              { name: "Sh. Alok Ranjan", designation: "D.M.(T) SO", phone: "23211207" },
              { name: "Sh. Naveen Kumar", designation: "D.M.(T) SO", phone: "23211207" },
              { name: "Sh. Sanjay Parida", designation: "AM(T) SO", phone: "23211207" },
              { name: "Sh. Himanshu", designation: "JE", phone: "23211207" },
              { name: "Sh. Saurabh Mishra", designation: "JE", phone: "23211207" }
            ]
          }
        },
        {
          id: "manager-so-shift",
          name: "Manager (SO Shift I, II, III & IV)",
          level: "operational",
          icon: Activity,
          details: {
            name: "System Operation - Shift",
            designation: "Manager (SO Shift I, II, III & IV)",
            team: [
              { name: "Sh. Birender Singh", designation: "Manager (SO) Shift - A", phone: "23221046", email: "managersos1@delhisldc.org" },
              { name: "Sh. Krishan Kumar", designation: "D.M.(T) (SO) Shift - A", phone: "23221098" },
              { name: "Sh. Samir Barla", designation: "D.M.(T) (SO) Shift - A", phone: "23221098" },
              { name: "Sh. Chandra Prakas Meena", designation: "A.M.(T) (SO) Shift - A", phone: "23221098" },
              { name: "Sh. Vivek Pandey", designation: "J.E.(E) (SO) Shift - A", phone: "23221098" },
              { name: "Sh. Sandeep Kumar", designation: "Manager (SO) Shift - B", phone: "23221099", email: "managersos2@delhisldc.org" },
              { name: "Sh. Kaushal Verma", designation: "D.M.(T) (SO) Shift - B", phone: "23221098" },
              { name: "Sh. Manoj Kumar Meena", designation: "A.M.(T) (SO) Shift - B", phone: "23221098" },
              { name: "Sh. Bharat Kanojia", designation: "D.M.(T) (SO) Shift - B", phone: "23221098" },
              { name: "Sh. Anil Chauhan", designation: "D.M.(T) (SO) Shift - B", phone: "23221098" },
              { name: "Sh. Abhishek Sharma", designation: "Manager (SO) Shift - C", phone: "23221046", email: "managersos3@delhisldc.org" },
              { name: "Sh. Manoj Kumar", designation: "D.M.(T) (SO) Shift - C", phone: "23221098" },
              { name: "Sh. Naresh Meena", designation: "A.M.(T) (SO) Shift - C", phone: "23221098" },
              { name: "Sh. Virender Kumar", designation: "A.M.(T) (SO) Shift - C", phone: "23221098" },
              { name: "Sh. Chetan Jagra", designation: "J.E.(E) (SO) Shift - C", phone: "23221098" },
              { name: "Sh. L. P. Meena", designation: "Manager (SO) Shift - D", phone: "23221046", email: "managersos4@delhisldc.org" },
              { name: "Sh. Mohd. Buronoddin", designation: "D.M.(T) (SO) Shift - D", phone: "23221098" },
              { name: "Sh. K.V. Krishnamohan", designation: "D.M.(T) (SO) Shift - D", phone: "23221019" },
              { name: "Sh. Pallav Aggarwal", designation: "D.M.(T) (SO) Shift - D", phone: "23221019" },
              { name: "Sh. Dharamvir", designation: "A.M.(T) (SO) Shift - D", phone: "23221098" }
            ]
          }
        }
      ]
    }
  ]
};