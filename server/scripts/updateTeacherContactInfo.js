const fs = require('fs');
const path = require('path');

// CSV data mapping
const csvData = [
  { name: "إبراهيم حمدي", email: "ibrahimmizo55@gmail.com", phone: "201092938667" },
  { name: "عمرو زاهر", email: "amr_zaher1@hotmail.com", phone: "201069033223" },
  { name: "ماهيتاب مصطفى", email: "mahetabmostafa92@gmail.com", phone: "201007789469" },
  { name: "أميرة شرف", email: "amairasharaf63@gmail.com", phone: "201016171132" },
  { name: "اسماء كحيل", email: "asmaa.m.kohail@gmail.com", phone: "201020193765" }, // CSV has space: 20102 0193765
  { name: "ابراهيم أحمد", email: "ibrahimahmed51620@gmail.com", phone: "201016224104" },
  { name: "نورهان عادل", email: "na765581@gmail.com", phone: "201017878976" },
  { name: "أسماء رفعت", email: "asmaa.tota.12345@gmail.com", phone: "201123663726" },
  { name: "عادل محمد", email: "adelmohamed18t5506@gmail.com", phone: "201101572707" },
  { name: "عمرو صلاح", email: "badrsalah525@gmail.com", phone: "201091073666" }, // CSV has spaces: 20109 107 3666
  { name: "علي توفيق", email: "Alyytawfik5@gmail.com", phone: "201012306778" },
  { name: "محمود السيد", email: "midomax817@gmail.com", phone: "201150423493" },
  { name: "ايمان محمد", email: "em5146990@gmail.com", phone: "201063076840" },
  { name: "الزهراء عصام", email: "alzahraaessam999@gmail.com", phone: "201021959341" },
  { name: "ضحي سعد الدين", email: "ddodo3451@gmail.com", phone: "201013527189" },
  { name: "زينب عاطف", email: "Zizeatef@gmail.com", phone: "201102103767" }, // CSV has spaces: 20110 210 3767
  { name: "هاجر منصور", email: "mansourhager985@gmail.com", phone: "201026123577" },
  { name: "همام حسام", email: "homamdimashky@gmail.com", phone: "201093695877" },
  { name: "منار عمرو", email: "manaramrhashem@gmail.com", phone: "201015673562" },
  { name: "رحاب عادل", email: "rehabadel252127@gmail.com", phone: "201140989001" },
  { name: "أميرة ناجي", email: "amiranagy901@gmail.com", phone: "201118225638" },
  { name: "هبة حربي", email: "hebaharby49@gmail.com", phone: "201016219707" },
  { name: "ايات فوزي", email: "foozayat@gmail.com", phone: "201113371847" },
  { name: "سارة علي", email: "Sarahzaki03@gmail.com", phone: "201023778899" },
  { name: "محمود الصباحي", email: "beeko3000@gmail.com", phone: "201000199325" },
  { name: "حنين", email: "Sarahzaki03@gmail.com", phone: "201019550168" },
  { name: "فاطمة عبد الودود", email: "Fatma.abdelwadod@gmail.com", phone: "201146513433" },
  { name: "صابرين عيسى", email: "gsgsghsgvzg@gmail.com", phone: "" },
  { name: "سحر ناجي", email: "reelban73@gmail.com", phone: "201157507968" },
  { name: "شيماء حسن", email: "ammazmwzh@gmail.com", phone: "201206455159" },
  { name: "محمد عصام", email: "mohamdilkhshen@gmail.com", phone: "201143136065" }
];

function updateTeacherContactInfo() {
  const teachersPath = path.join(__dirname, '../data/teachers.json');
  
  // Create backup
  const backupPath = path.join(__dirname, '../data/teachers_backup_' + Date.now() + '.json');
  
  try {
    // Read current teachers data
    const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    
    // Save backup
    fs.writeFileSync(backupPath, JSON.stringify(teachers, null, 2));
    console.log('✅ Backup created:', backupPath);
    
    let updatedCount = 0;
    let notFoundNames = [];
    
    // Update teacher information
    csvData.forEach(csvRecord => {
      // Find teacher by name (handle slight variations)
      const teacher = teachers.find(t => {
        const normalizedTeacherName = t.name.trim().replace(/\s+/g, ' ');
        const normalizedCsvName = csvRecord.name.trim().replace(/\s+/g, ' ');
        return normalizedTeacherName === normalizedCsvName;
      });
      
      if (teacher) {
        const oldEmail = teacher.email;
        const oldPhone = teacher.phone;
        
        // Update email
        teacher.email = csvRecord.email.trim().replace(/\s+/g, '');
        
        // Update phone (add +966 prefix for Saudi numbers)
        if (csvRecord.phone) {
          // Remove spaces and normalize phone number
          let phone = csvRecord.phone.replace(/\s+/g, '');
          // Add +966 prefix if it starts with 20
          if (phone.startsWith('20')) {
            phone = '+966' + phone.substring(2);
          } else if (!phone.startsWith('+')) {
            phone = '+966' + phone;
          }
          teacher.phone = phone;
        }
        
        console.log(`✅ Updated ${teacher.name}:`);
        console.log(`   Email: ${oldEmail} → ${teacher.email}`);
        console.log(`   Phone: ${oldPhone} → ${teacher.phone}`);
        updatedCount++;
      } else {
        notFoundNames.push(csvRecord.name);
      }
    });
    
    // Save updated data
    fs.writeFileSync(teachersPath, JSON.stringify(teachers, null, 2));
    
    console.log('\n📊 Summary:');
    console.log(`✅ Updated ${updatedCount} teachers`);
    if (notFoundNames.length > 0) {
      console.log(`❌ Not found in database: ${notFoundNames.join(', ')}`);
    }
    
    // Also update managers.json if it exists
    const managersPath = path.join(__dirname, '../data/managers.json');
    if (fs.existsSync(managersPath)) {
      const managers = JSON.parse(fs.readFileSync(managersPath, 'utf8'));
      let managersUpdated = 0;
      
      csvData.forEach(csvRecord => {
        const manager = managers.find(m => m.name === csvRecord.name);
        if (manager) {
          manager.email = csvRecord.email.trim().replace(/\s+/g, '');
          if (csvRecord.phone) {
            let phone = csvRecord.phone.replace(/\s+/g, '');
            if (phone.startsWith('20')) {
              phone = '+966' + phone.substring(2);
            } else if (!phone.startsWith('+')) {
              phone = '+966' + phone;
            }
            manager.phone = phone;
          }
          managersUpdated++;
        }
      });
      
      if (managersUpdated > 0) {
        fs.writeFileSync(managersPath, JSON.stringify(managers, null, 2));
        console.log(`✅ Also updated ${managersUpdated} managers`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating teacher contact info:', error);
    process.exit(1);
  }
}

// Run the update
updateTeacherContactInfo();