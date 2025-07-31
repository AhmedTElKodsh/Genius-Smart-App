const fs = require('fs');
const path = require('path');

// CSV data mapping - phone numbers exactly as in CSV but without spaces
const csvData = [
  { name: "إبراهيم حمدي", phone: "201092938667" },
  { name: "عمرو زاهر", phone: "201069033223" },
  { name: "ماهيتاب مصطفى", phone: "201007789469" },
  { name: "أميرة شرف", phone: "201016171132" },
  { name: "اسماء كحيل", phone: "201020193765" }, // CSV: 20102 0193765
  { name: "ابراهيم أحمد", phone: "201016224104" },
  { name: "نورهان عادل", phone: "201017878976" },
  { name: "أسماء رفعت", phone: "201123663726" },
  { name: "عادل محمد", phone: "201101572707" },
  { name: "عمرو صلاح", phone: "201091073666" }, // CSV: 20109 107 3666
  { name: "علي توفيق", phone: "201012306778" },
  { name: "محمود السيد", phone: "201150423493" },
  { name: "ايمان محمد", phone: "201063076840" },
  { name: "الزهراء عصام", phone: "201021959341" },
  { name: "ضحي سعد الدين", phone: "201013527189" },
  { name: "زينب عاطف", phone: "201102103767" }, // CSV: 20110 210 3767
  { name: "هاجر منصور", phone: "201026123577" },
  { name: "همام حسام", phone: "201093695877" },
  { name: "منار عمرو", phone: "201015673562" },
  { name: "رحاب عادل", phone: "201140989001" },
  { name: "أميرة ناجي", phone: "201118225638" },
  { name: "هبة حربي", phone: "201016219707" },
  { name: "ايات فوزي", phone: "201113371847" },
  { name: "سارة علي", phone: "201023778899" },
  { name: "محمود الصباحي", phone: "201000199325" },
  { name: "حنين", phone: "201019550168" },
  { name: "فاطمة عبد الودود", phone: "201146513433" },
  { name: "صابرين عيسى", phone: "" }, // No phone in CSV
  { name: "سحر ناجي", phone: "201157507968" },
  { name: "شيماء حسن", phone: "201206455159" },
  { name: "محمد عصام", phone: "201143136065" }
];

function updatePhoneNumbers() {
  const teachersPath = path.join(__dirname, '../data/teachers.json');
  
  try {
    // Read current teachers data
    const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    
    let updatedCount = 0;
    
    // Update phone numbers
    csvData.forEach(csvRecord => {
      const teacher = teachers.find(t => t.name.trim() === csvRecord.name.trim());
      
      if (teacher) {
        const oldPhone = teacher.phone;
        
        // Set phone exactly as in CSV (without spaces)
        if (csvRecord.phone) {
          teacher.phone = csvRecord.phone;
        }
        
        if (oldPhone !== teacher.phone) {
          console.log(`✅ Updated ${teacher.name}:`);
          console.log(`   Phone: ${oldPhone} → ${teacher.phone}`);
          updatedCount++;
        }
      }
    });
    
    // Save updated data
    fs.writeFileSync(teachersPath, JSON.stringify(teachers, null, 2));
    
    console.log(`\n📊 Total phone numbers updated: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Error updating phone numbers:', error);
    process.exit(1);
  }
}

// Run the update
updatePhoneNumbers();