// 生成日常记录示例数据脚本

const fs = require('fs');
const path = require('path');

// MealStatus枚举值
const MealStatus = {
  NOT_EATEN: 'not_eaten',
  EATEN_IRREGULAR: 'eaten_irregular',
  EATEN_REGULAR: 'eaten_regular'
};

// 随机选择数组中的一个元素
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 生成随机布尔值
function randomBoolean() {
  return Math.random() > 0.5;
}

// 生成随机整数（包含min和max）
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 格式化日期为YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 判断是否是工作日（周一到周五）
function isWeekday(date) {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

// 生成打卡时间（工作日）
function generateWorkTimes() {
  // 签到时间：08:00-09:30之间
  const checkInHour = randomInt(8, 9);
  const checkInMinute = checkInHour === 8 ? randomInt(0, 59) : randomInt(0, 30);
  const checkInTime = `${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}`;
  
  // 签退时间：18:00-19:00之间
  const checkOutHour = 18;
  const checkOutMinute = randomInt(0, 59);
  const checkOutTime = `${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}`;
  
  // 离开时间：22:00-23:00之间
  const leaveHour = randomInt(22, 23);
  const leaveMinute = leaveHour === 22 ? randomInt(0, 59) : randomInt(0, 30);
  const leaveTime = `${String(leaveHour).padStart(2, '0')}:${String(leaveMinute).padStart(2, '0')}`;
  
  return { checkInTime, checkOutTime, leaveTime };
}

// 生成一条日常记录
function generateDailyRecord(date, index) {
  const isWorkDay = isWeekday(date);
  const dateStr = formatDate(date);
  
  const record = {
    id: `daily_sample_${index + 1}`,
    date: dateStr,
    meals: {
      breakfast: randomChoice(Object.values(MealStatus)),
      lunch: randomChoice(Object.values(MealStatus)),
      dinner: randomChoice(Object.values(MealStatus))
    },
    hygiene: {
      morningWash: randomBoolean(),
      nightWash: randomBoolean()
    },
    bathing: {
      shower: randomBoolean(),
      hairWash: randomBoolean(),
      footWash: randomBoolean(),
      faceWash: randomBoolean()
    },
    laundry: randomBoolean(),
    cleaning: randomBoolean(),
    wechatSteps: randomInt(0, 30000),
    notes: '示例数据',
    createdAt: new Date(date).toISOString()
  };
  
  // 工作日添加打卡时间
  if (isWorkDay) {
    const times = generateWorkTimes();
    record.checkInTime = times.checkInTime;
    record.checkOutTime = times.checkOutTime;
    record.leaveTime = times.leaveTime;
  }
  
  return record;
}

// 生成正常文件（从2025-10-01到今天）
function generateFullData() {
  const startDate = new Date('2025-10-01');
  const today = new Date();
  const records = [];
  
  let currentDate = new Date(startDate);
  let index = 0;
  
  while (currentDate <= today) {
    records.push(generateDailyRecord(currentDate, index));
    currentDate.setDate(currentDate.getDate() + 1);
    index++;
  }
  
  const exportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    dailyRecords: records,
    totalRecords: records.length
  };
  
  return exportData;
}

// 生成轻量级文件（10条，10月和11月各5条）
function generateLightData() {
  const records = [];
  
  // 10月的5条数据（分散在10月）
  const octoberDates = [
    new Date('2025-10-05'),
    new Date('2025-10-12'),
    new Date('2025-10-18'),
    new Date('2025-10-24'),
    new Date('2025-10-30')
  ];
  
  // 11月的5条数据（分散在11月）
  const novemberDates = [
    new Date('2025-11-03'),
    new Date('2025-11-10'),
    new Date('2025-11-16'),
    new Date('2025-11-22'),
    new Date('2025-11-28')
  ];
  
  let index = 0;
  
  // 生成10月数据
  octoberDates.forEach(date => {
    records.push(generateDailyRecord(date, index));
    index++;
  });
  
  // 生成11月数据
  novemberDates.forEach(date => {
    records.push(generateDailyRecord(date, index));
    index++;
  });
  
  const exportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    dailyRecords: records,
    totalRecords: records.length
  };
  
  return exportData;
}

// 主函数
function main() {
  const sampleDataDir = path.join(__dirname, 'public', 'sample-data');
  
  // 确保目录存在
  if (!fs.existsSync(sampleDataDir)) {
    fs.mkdirSync(sampleDataDir, { recursive: true });
  }
  
  // 生成正常文件
  const fullData = generateFullData();
  const fullPath = path.join(sampleDataDir, 'daily.json');
  fs.writeFileSync(fullPath, JSON.stringify(fullData, null, 2), 'utf8');
  console.log(`✅ 已生成正常文件: ${fullPath} (${fullData.totalRecords}条记录)`);
  
  // 生成轻量级文件
  const lightData = generateLightData();
  const lightPath = path.join(sampleDataDir, 'daily-light.json');
  fs.writeFileSync(lightPath, JSON.stringify(lightData, null, 2), 'utf8');
  console.log(`✅ 已生成轻量级文件: ${lightPath} (${lightData.totalRecords}条记录)`);
  
  console.log('\n生成完成！');
}

main();

