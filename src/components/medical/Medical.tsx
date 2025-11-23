import React, { useRef, useState } from 'react';
import FormSelect from '@/components/common/FormSelect/FormSelect';
import './Medical.scss';

type DiseaseType = 'hernia';

const Medical: React.FC = () => {
  // 疾病类型状态（暂时只有食管裂孔疝）
  const [selectedDisease, setSelectedDisease] = useState<DiseaseType>('hernia');

  // 创建各section的引用
  const overviewRef = useRef<HTMLElement>(null);
  const causeRef = useRef<HTMLElement>(null);
  const symptomsRef = useRef<HTMLElement>(null);
  const treatmentRef = useRef<HTMLElement>(null);
  const dietRef = useRef<HTMLElement>(null);
  const lifestyleRef = useRef<HTMLElement>(null);
  const researchRef = useRef<HTMLElement>(null);
  const prognosisRef = useRef<HTMLElement>(null);
  const recoveryRef = useRef<HTMLElement>(null);

  // 滚动到指定section
  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // 切换疾病类型
  const handleDiseaseChange = (disease: string) => {
    setSelectedDisease(disease as DiseaseType);
    // 切换后滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 疾病选项（暂时只有食管裂孔疝）
  const diseaseOptions = [
    { value: 'hernia', label: '食管裂孔疝' }
  ];

  return (
    <div className="medical-record">
      {/* 左侧导航菜单 */}
      <nav className="medical-record__nav">
        <div className="disease-select-wrapper">
          <FormSelect
            value={selectedDisease}
            onChange={handleDiseaseChange}
            options={diseaseOptions}
            placeholder="选择疾病"
          />
        </div>
        <ul className="nav-list">
          <li onClick={() => scrollToSection(overviewRef)}>
            <span className="nav-icon">📋</span>
            <span>疾病概述</span>
          </li>
          <li onClick={() => scrollToSection(causeRef)}>
            <span className="nav-icon">🔬</span>
            <span>病因分析</span>
          </li>
          <li onClick={() => scrollToSection(symptomsRef)}>
            <span className="nav-icon">🩺</span>
            <span>症状表现</span>
          </li>
          <li onClick={() => scrollToSection(treatmentRef)}>
            <span className="nav-icon">💊</span>
            <span>治疗方法</span>
          </li>
          <li onClick={() => scrollToSection(dietRef)}>
            <span className="nav-icon">🍽️</span>
            <span>饮食注意</span>
          </li>
          <li onClick={() => scrollToSection(lifestyleRef)}>
            <span className="nav-icon">🏃</span>
            <span>生活方式</span>
          </li>
          <li onClick={() => scrollToSection(researchRef)}>
            <span className="nav-icon">🔬</span>
            <span>前沿研究</span>
          </li>
          <li onClick={() => scrollToSection(prognosisRef)}>
            <span className="nav-icon">📈</span>
            <span>预后随访</span>
          </li>
          <li onClick={() => scrollToSection(recoveryRef)}>
            <span className="nav-icon">💪</span>
            <span>康复管理</span>
          </li>
        </ul>
      </nav>

      {/* 主内容区域 */}
      <div className="medical-record__main">
        <div className="medical-record__content">

          {/* 食管裂孔疝内容 */}
          {selectedDisease === 'hernia' && (
            <>
              {/* 疾病概述 */}
              <section className="medical-section" ref={overviewRef}>
                <h3 className="section-title">
                  <span className="icon">📋</span>
                  疾病概述
                </h3>
                <div className="section-content">
                  <p>
                    <strong>食管裂孔疝(Hiatal Hernia)</strong>是指腹腔内脏器(主要是胃)通过膈肌的食管裂孔进入胸腔的一种疾病。
                    膈肌是分隔胸腔和腹腔的肌肉,食管裂孔是食管通过膈肌的开口。当这个开口变大或周围组织松弛时,胃的一部分就可能向上突入胸腔。
                  </p>
                  <div className="highlight-box">
                    <h4>主要特征</h4>
                    <ul>
                      <li><strong>解剖异常</strong>:胃的一部分通过膈肌进入胸腔</li>
                      <li><strong>常见疾病</strong>:50岁以上人群中约60%有不同程度的裂孔疝</li>
                      <li><strong>多数无症状</strong>:许多患者没有明显症状,偶然发现</li>
                      <li><strong>与GERD相关</strong>:可能导致或加重胃食管反流症状</li>
                    </ul>
                  </div>
                  <div className="highlight-box" style={{ marginTop: '1rem' }}>
                    <h4>分型</h4>
                    <ul>
                      <li><strong>Ⅰ型(滑动型)</strong>:最常见(90%),胃食管连接部上移至胸腔</li>
                      <li><strong>Ⅱ型(食管旁型)</strong>:胃底通过裂孔进入胸腔,胃食管连接部位置正常</li>
                      <li><strong>Ⅲ型(混合型)</strong>:同时具有I型和II型特征</li>
                      <li><strong>Ⅳ型(巨大型)</strong>:其他腹腔器官(如结肠、脾脏)也进入胸腔</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 病因分析 */}
              <section className="medical-section" ref={causeRef}>
                <h3 className="section-title">
                  <span className="icon">🔬</span>
                  病因分析
                </h3>
                <div className="section-content">
                  <div className="cause-grid">
                    <div className="cause-card">
                      <h4>🧬 先天因素</h4>
                      <p>食管裂孔天生过大,或膈肌发育不全,导致腹腔器官容易突入胸腔</p>
                    </div>
                    <div className="cause-card">
                      <h4>⏳ 年龄老化</h4>
                      <p>随着年龄增长,膈肌和食管裂孔周围组织松弛、弹性下降,是最主要的原因</p>
                    </div>
                    <div className="cause-card">
                      <h4>💪 腹压增高</h4>
                      <p>慢性咳嗽、便秘、腹水、妊娠、肥胖等导致腹腔压力长期增高</p>
                    </div>
                    <div className="cause-card">
                      <h4>🏋️ 外伤手术</h4>
                      <p>腹部外伤或食管、胃部手术可能损伤膈肌或改变解剖结构</p>
                    </div>
                    <div className="cause-card">
                      <h4>⚖️ 肥胖因素</h4>
                      <p>体重过重增加腹腔压力,同时腹腔脂肪增多推压脏器上移</p>
                    </div>
                    <div className="cause-card">
                      <h4>🍔 饮食习惯</h4>
                      <p>暴饮暴食导致胃扩张,长期过度充盈增加向上突出的风险</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 症状表现 */}
              <section className="medical-section" ref={symptomsRef}>
                <h3 className="section-title">
                  <span className="icon">🩺</span>
                  症状表现
                </h3>
                <div className="section-content">
                  <div className="symptoms-grid">
                    <div className="symptom-category">
                      <h4 className="symptom-title">反流相关症状</h4>
                      <ul className="symptom-list">
                        <li>烧心、反酸(尤其餐后和平卧时)</li>
                        <li>胸骨后疼痛或不适</li>
                        <li>吞咽困难或疼痛</li>
                        <li>慢性咳嗽</li>
                        <li>声音嘶哑</li>
                      </ul>
                    </div>
                    <div className="symptom-category">
                      <h4 className="symptom-title">胸腹部症状</h4>
                      <ul className="symptom-list">
                        <li>上腹部或胸部饱胀感</li>
                        <li>进食后腹部不适</li>
                        <li>嗳气、打嗝频繁</li>
                        <li>恶心、呕吐</li>
                        <li>胸部压迫感</li>
                      </ul>
                    </div>
                    <div className="symptom-category">
                      <h4 className="symptom-title">严重并发症</h4>
                      <ul className="symptom-list">
                        <li>贫血(慢性失血)</li>
                        <li>胃扭转或嵌顿(急性)</li>
                        <li>呼吸困难(大型疝)</li>
                        <li>心律不齐(压迫心脏)</li>
                        <li>溃疡或出血</li>
                      </ul>
                    </div>
                  </div>
                  <div className="highlight-box" style={{ marginTop: '1.5rem' }}>
                    <h4>⚠️ 特别提示</h4>
                    <p>
                      <strong>多数食管裂孔疝患者无明显症状</strong>,尤其是小型滑动型疝。
                      症状的严重程度与疝的大小不一定成正比,小疝可能有明显症状,而大疝可能症状轻微。
                      如出现剧烈胸痛、持续呕吐、无法进食等急性症状,应立即就医,可能是疝嵌顿的表现。
                    </p>
                  </div>
                </div>
              </section>

              {/* 治疗方法 */}
              <section className="medical-section" ref={treatmentRef}>
                <h3 className="section-title">
                  <span className="icon">💊</span>
                  治疗方法
                </h3>
                <div className="section-content">
                  <div className="treatment-section">
                    <h4 className="treatment-subtitle">🔹 保守治疗</h4>
                    <p>适用于无症状或症状轻微的患者,以及不适合手术的高龄或高危患者:</p>
                    
                    <div className="medication-grid">
                      <div className="medication-card">
                        <h5>质子泵抑制剂(PPI)</h5>
                        <p className="drug-examples">如:奥美拉唑、兰索拉唑、雷贝拉唑、艾司奥美拉唑</p>
                        <p className="drug-desc">控制胃酸分泌,减轻反流症状,是首选药物</p>
                        <div className="drug-note">
                          <strong>用法:</strong>餐前30-60分钟服用,症状控制后可减量维持
                        </div>
                      </div>
                      <div className="medication-card">
                        <h5>促胃肠动力药</h5>
                        <p className="drug-examples">如:莫沙必利、伊托必利、多潘立酮</p>
                        <p className="drug-desc">增强食管蠕动,促进胃排空,减少反流</p>
                      </div>
                      <div className="medication-card">
                        <h5>抗酸药</h5>
                        <p className="drug-examples">如:铝碳酸镁、碳酸氢钠</p>
                        <p className="drug-desc">快速中和胃酸,缓解急性症状</p>
                      </div>
                      <div className="medication-card">
                        <h5>黏膜保护剂</h5>
                        <p className="drug-examples">如:硫糖铝、铝碳酸镁</p>
                        <p className="drug-desc">保护食管黏膜,促进损伤修复</p>
                      </div>
                    </div>
                  </div>

                  <div className="treatment-section">
                    <h4 className="treatment-subtitle">🔹 手术治疗</h4>
                    <div className="highlight-box">
                      <h4>手术适应症</h4>
                      <ul>
                        <li>症状严重且药物治疗无效</li>
                        <li>Ⅱ、Ⅲ、Ⅳ型裂孔疝(食管旁型及以上)</li>
                        <li>出现并发症:如溃疡、出血、狭窄、嵌顿</li>
                        <li>疝囊较大(&gt;5cm)即使无症状也可考虑</li>
                        <li>反复发作的误吸性肺炎</li>
                        <li>年轻患者不愿长期服药</li>
                      </ul>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                      <h5 style={{ color: '#667eea', marginBottom: '1rem' }}>主要手术方式</h5>
                      <div className="cause-grid">
                        <div className="cause-card">
                          <h4>🔧 腹腔镜胃底折叠术</h4>
                          <p><strong>Nissen胃底折叠术:</strong>将胃底360°环绕食管下段,重建抗反流屏障</p>
                          <p><strong>Toupet胃底折叠术:</strong>270°部分折叠,适合食管动力较差的患者</p>
                          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                            优点:微创、恢复快、住院时间短
                          </p>
                        </div>
                        <div className="cause-card">
                          <h4>🏥 裂孔修补术</h4>
                          <p>缝合加固食管裂孔,缩小裂孔直径,防止胃再次突入胸腔</p>
                          <p style={{ marginTop: '0.5rem' }}>必要时使用人工补片加固薄弱的膈肌</p>
                        </div>
                        <div className="cause-card">
                          <h4>🔬 LINX手术</h4>
                          <p>在食管下端放置磁性环,增强括约肌功能,允许食物通过但阻止反流</p>
                          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                            较新技术,可逆性强
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="highlight-box" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%)', borderColor: '#ffe699' }}>
                      <h4 style={{ color: '#f39c12' }}>💡 手术注意事项</h4>
                      <ul>
                        <li>手术成功率高(90%以上),但需要经验丰富的外科医生</li>
                        <li>术后可能出现吞咽困难、腹胀、无法嗳气等症状,通常会逐渐改善</li>
                        <li>少数患者可能复发,需要再次手术</li>
                        <li>术后仍需注意饮食和生活方式调整</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 饮食建议 */}
              <section className="medical-section" ref={dietRef}>
                <h3 className="section-title">
                  <span className="icon">🍽️</span>
                  饮食注意事项
                </h3>
                <div className="section-content">
                  <div className="diet-grid">
                    <div className="diet-card diet-avoid">
                      <h4>❌ 应避免的食物</h4>
                      <div className="food-category">
                        <h5>易引起反流的食物</h5>
                        <ul>
                          <li>油炸、高脂肪食物</li>
                          <li>巧克力</li>
                          <li>咖啡、浓茶</li>
                          <li>碳酸饮料</li>
                          <li>酒精类饮品</li>
                          <li>薄荷</li>
                        </ul>
                      </div>
                      <div className="food-category">
                        <h5>刺激性食物</h5>
                        <ul>
                          <li>辛辣食物(辣椒、花椒等)</li>
                          <li>酸性食物(柑橘、番茄等)</li>
                          <li>洋葱、大蒜(生食)</li>
                        </ul>
                      </div>
                      <div className="food-category">
                        <h5>其他不宜食物</h5>
                        <ul>
                          <li>过硬、难消化的食物</li>
                          <li>易产气食物(豆类、洋葱等)</li>
                          <li>过冷或过热的食物</li>
                        </ul>
                      </div>
                    </div>

                    <div className="diet-card diet-recommend">
                      <h4>✅ 推荐的食物</h4>
                      <div className="food-category">
                        <h5>主食类</h5>
                        <ul>
                          <li>软烂的米饭、粥</li>
                          <li>面条、馒头</li>
                          <li>燕麦、小米</li>
                          <li>全麦面包(非油炸)</li>
                        </ul>
                      </div>
                      <div className="food-category">
                        <h5>蛋白质</h5>
                        <ul>
                          <li>瘦肉(鸡肉、鱼肉)</li>
                          <li>鸡蛋(煮、蒸)</li>
                          <li>豆腐及豆制品</li>
                          <li>低脂奶制品</li>
                        </ul>
                      </div>
                      <div className="food-category">
                        <h5>蔬菜类</h5>
                        <ul>
                          <li>绿叶蔬菜(菠菜、油菜)</li>
                          <li>根茎类(胡萝卜、山药)</li>
                          <li>南瓜、西兰花</li>
                          <li>芦笋、芹菜</li>
                        </ul>
                      </div>
                      <div className="food-category">
                        <h5>水果类</h5>
                        <ul>
                          <li>香蕉</li>
                          <li>苹果(去皮)</li>
                          <li>木瓜</li>
                          <li>梨(蒸熟)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="diet-tips">
                    <h4>🔸 饮食习惯建议</h4>
                    <ul className="tips-list">
                      <li><strong>少量多餐:</strong>每餐不要吃太饱,建议每天5-6小餐,每餐七分饱</li>
                      <li><strong>细嚼慢咽:</strong>充分咀嚼食物,减轻胃的负担</li>
                      <li><strong>餐后活动:</strong>餐后不要立即平躺,保持直立或散步30分钟以上</li>
                      <li><strong>睡前禁食:</strong>睡前3-4小时内不进食,避免夜间反流</li>
                      <li><strong>饮水时机:</strong>两餐之间饮水,餐中不要大量喝水</li>
                      <li><strong>避免弯腰:</strong>餐后避免弯腰、下蹲等增加腹压的动作</li>
                      <li><strong>控制总量:</strong>即使是推荐食物,也不要一次吃太多</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 生活方式调整 */}
              <section className="medical-section" ref={lifestyleRef}>
                <h3 className="section-title">
                  <span className="icon">🏃</span>
                  生活方式调整
                </h3>
                <div className="section-content">
                  <div className="lifestyle-grid">
                    <div className="lifestyle-card">
                      <h4>🛏️ 睡眠调整</h4>
                      <ul>
                        <li>抬高床头15-20cm(垫高整个床头,不只是枕头)</li>
                        <li>左侧卧位睡眠更佳</li>
                        <li>使用楔形枕头</li>
                        <li>避免餐后立即平卧</li>
                      </ul>
                    </div>
                    <div className="lifestyle-card">
                      <h4>⚖️ 体重管理</h4>
                      <ul>
                        <li>减轻体重至正常BMI范围</li>
                        <li>减少腹部脂肪堆积</li>
                        <li>规律适度运动</li>
                        <li>避免剧烈运动(尤其餐后)</li>
                      </ul>
                    </div>
                    <div className="lifestyle-card">
                      <h4>👔 衣着穿戴</h4>
                      <ul>
                        <li>穿着宽松舒适的衣服</li>
                        <li>避免紧身衣裤</li>
                        <li>不系紧腰带或束腰</li>
                        <li>减少腹部压迫</li>
                      </ul>
                    </div>
                    <div className="lifestyle-card">
                      <h4>🚭 戒除不良习惯</h4>
                      <ul>
                        <li>戒烟(吸烟降低括约肌压力)</li>
                        <li>限制或戒酒</li>
                        <li>避免过度咖啡因</li>
                        <li>规律作息时间</li>
                      </ul>
                    </div>
                    <div className="lifestyle-card">
                      <h4>🏃 活动姿势</h4>
                      <ul>
                        <li>避免长时间弯腰工作</li>
                        <li>提重物时注意姿势</li>
                        <li>避免增加腹压的动作</li>
                        <li>适当做直立性活动</li>
                      </ul>
                    </div>
                    <div className="lifestyle-card">
                      <h4>😌 压力管理</h4>
                      <ul>
                        <li>学习放松技巧</li>
                        <li>保持情绪稳定</li>
                        <li>适度运动减压</li>
                        <li>保证充足睡眠</li>
                      </ul>
                    </div>
                  </div>

                  <div className="highlight-box" style={{ marginTop: '1.5rem' }}>
                    <h4>💪 推荐的运动方式</h4>
                    <ul>
                      <li><strong>散步:</strong>餐后30分钟散步,促进消化</li>
                      <li><strong>游泳:</strong>水平运动,不增加腹压</li>
                      <li><strong>瑜伽:</strong>温和的瑜伽动作,避免倒立和强烈扭转</li>
                      <li><strong>太极:</strong>舒缓的全身运动</li>
                    </ul>
                    <p style={{ marginTop: '1rem', color: '#d63447', fontWeight: '500' }}>
                      ⚠️ 应避免:仰卧起坐、举重、剧烈跑步等增加腹压的运动
                    </p>
                  </div>
                </div>
              </section>

              {/* 前沿研究 */}
              <section className="medical-section" ref={researchRef}>
                <h3 className="section-title">
                  <span className="icon">🔬</span>
                  前沿研究与新进展
                </h3>
                <div className="section-content">
                  <div className="research-items">
                    <div className="research-item">
                      <h4>🤖 机器人辅助手术</h4>
                      <p>
                        达芬奇机器人手术系统在裂孔疝修补术中的应用越来越广泛,提供更精确的操作、
                        更好的视野和更灵活的器械操控,减少手术创伤,加快康复速度。
                      </p>
                    </div>
                    <div className="research-item">
                      <h4>🧵 生物材料补片</h4>
                      <p>
                        新型可吸收生物补片和生物诱导材料的研发,能更好地与人体组织整合,
                        降低排异反应和复发率,特别适用于大型裂孔疝的修补。
                      </p>
                    </div>
                    <div className="research-item">
                      <h4>🔍 精准诊断技术</h4>
                      <p>
                        高分辨率食管测压、24小时pH-阻抗监测、三维CT重建等技术的进步,
                        能更准确地评估疝的大小、类型和功能影响,制定个体化治疗方案。
                      </p>
                    </div>
                    <div className="research-item">
                      <h4>💊 新型抗反流设备</h4>
                      <p>
                        除LINX磁环外,新的抗反流设备如可注射的生物凝胶、
                        内镜下射频治疗等微创技术正在研究中,为不适合手术的患者提供新选择。
                      </p>
                    </div>
                    <div className="research-item">
                      <h4>🧬 基因与遗传研究</h4>
                      <p>
                        研究发现某些基因变异可能增加裂孔疝的易感性,
                        了解遗传因素有助于早期预防和风险评估。
                      </p>
                    </div>
                    <div className="research-item">
                      <h4>📊 长期预后研究</h4>
                      <p>
                        大规模队列研究正在评估不同治疗方案的长期效果、
                        生活质量改善和并发症发生率,为临床决策提供更多循证医学证据。
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 预后与随访 */}
              <section className="medical-section" ref={prognosisRef}>
                <h3 className="section-title">
                  <span className="icon">📈</span>
                  预后与随访
                </h3>
                <div className="section-content">
                  <div className="prognosis-box">
                    <h4>整体预后</h4>
                    <p>
                      食管裂孔疝本身是良性疾病,预后总体良好。大多数小型滑动疝患者通过生活方式调整和药物治疗可以有效控制症状。
                      需要手术的患者,术后症状缓解率达到85-95%,但需注意复发风险(5-10年复发率约10-30%)。
                    </p>
                  </div>

                  <div className="followup-schedule">
                    <h4>随访建议</h4>
                    <ul>
                      <li><strong>保守治疗患者:</strong>每6-12个月复诊,评估症状变化和药物疗效</li>
                      <li><strong>术后早期(前6个月):</strong>术后2周、1个月、3个月、6个月复诊</li>
                      <li><strong>术后长期:</strong>每年复诊一次,必要时行胃镜或上消化道造影检查</li>
                      <li><strong>有并发症风险者:</strong>如Barrett食管、食管狭窄,需更频繁随访</li>
                    </ul>
                  </div>

                  <div className="warning-signs">
                    <h4>⚠️ 需要警惕的症状</h4>
                    <ul className="warning-list">
                      <li>剧烈持续的胸痛或上腹痛</li>
                      <li>吞咽困难加重或完全不能进食</li>
                      <li>持续恶心呕吐</li>
                      <li>呕血或黑便</li>
                      <li>不明原因体重下降</li>
                      <li>呼吸困难、胸闷加重</li>
                      <li>心悸、心律不齐</li>
                    </ul>
                    <p className="warning-note">
                      <strong>紧急情况:</strong>如出现剧烈胸腹痛、无法进食、持续呕吐等症状,
                      可能是疝嵌顿或胃扭转,属于外科急症,应立即就医!
                    </p>
                  </div>

                  <div className="highlight-box" style={{ marginTop: '1.5rem' }}>
                    <h4>定期检查项目</h4>
                    <ul>
                      <li><strong>胃镜检查:</strong>评估食管炎程度,排除Barrett食管或恶变</li>
                      <li><strong>上消化道造影:</strong>观察疝的大小和位置变化</li>
                      <li><strong>食管测压:</strong>评估食管动力功能</li>
                      <li><strong>24小时pH监测:</strong>评估反流控制情况</li>
                      <li><strong>血常规:</strong>检查是否有慢性出血导致的贫血</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 康复建议 */}
              <section className="medical-section" ref={recoveryRef}>
                <h3 className="section-title">
                  <span className="icon">💪</span>
                  康复与自我管理
                </h3>
                <div className="section-content">
                  <div className="recovery-tips">
                    <div className="tip-box">
                      <h4>📝 症状日记</h4>
                      <p>
                        记录每日饮食、活动、症状发作情况,帮助识别个人的诱发因素,
                        调整生活习惯。对医生制定治疗方案也很有帮助。
                      </p>
                    </div>
                    <div className="tip-box">
                      <h4>🎯 阶段性目标</h4>
                      <p>
                        设定可实现的短期目标,如减重5公斤、戒烟、改善睡眠质量等,
                        循序渐进地改善病情。
                      </p>
                    </div>
                    <div className="tip-box">
                      <h4>👨‍⚕️ 医患合作</h4>
                      <p>
                        定期复诊,如实向医生反馈症状变化和治疗效果,
                        共同调整治疗方案。不要擅自停药或改变剂量。
                      </p>
                    </div>
                    <div className="tip-box">
                      <h4>📚 疾病教育</h4>
                      <p>
                        了解食管裂孔疝的病理机制、治疗方法和预后,
                        从权威医疗机构获取信息,提高自我管理能力。
                      </p>
                    </div>
                    <div className="tip-box">
                      <h4>🤝 家庭支持</h4>
                      <p>
                        与家人沟通病情,获得理解和支持。家庭成员的配合
                        (如调整饮食习惯)对疾病管理很重要。
                      </p>
                    </div>
                    <div className="tip-box">
                      <h4>💪 术后康复</h4>
                      <p>
                        手术后按医嘱逐步恢复饮食和活动,
                        注意伤口护理,避免过早提重物。大多数患者2-4周可恢复日常活动。
                      </p>
                    </div>
                  </div>

                  <div className="highlight-box" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #f0fff4 0%, #e0ffe0 100%)', borderColor: '#b3ffb3' }}>
                    <h4 style={{ color: '#28a745' }}>✨ 积极的生活态度</h4>
                    <p>
                      食管裂孔疝虽然是慢性疾病,但通过规范治疗和生活方式调整,
                      绝大多数患者可以过上正常的生活。保持乐观心态,
                      积极配合治疗,定期随访,是成功管理疾病的关键。
                    </p>
                    <p style={{ marginTop: '0.75rem' }}>
                      记住:这是一个可以有效控制的疾病,你并不孤单,
                      医疗团队会与你一起努力,帮助你重获健康和生活质量!
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* 免责声明 */}
          <div className="disclaimer">
            <h4>⚕️ 医学免责声明</h4>
            <p>
              本页面提供的信息仅供参考和教育目的,不能替代专业医疗建议、诊断或治疗。
              任何健康问题都应咨询合格的医疗专业人员。请勿仅根据本页面信息自行诊断或治疗。
              如有疑问或症状加重,请及时就医。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medical;
