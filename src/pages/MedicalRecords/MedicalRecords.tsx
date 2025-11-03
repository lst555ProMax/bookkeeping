import React from 'react';
import './MedicalRecords.scss';

const MedicalRecords: React.FC = () => {
  return (
    <div className="medical-record">
      <div className="medical-record__header">
        <h2>💊 病记 - 胃食管反流导致的慢性咽炎</h2>
        <p className="subtitle">Gastroesophageal Reflux-Induced Chronic Pharyngitis</p>
      </div>

      <div className="medical-record__content">
        {/* 疾病概述 */}
        <section className="medical-section">
          <h3 className="section-title">
            <span className="icon">📋</span>
            疾病概述
          </h3>
          <div className="section-content">
            <p>
              <strong>胃食管反流病（GERD）</strong>是指胃内容物反流入食管或咽喉，引起不适症状和/或并发症的一种疾病。
              当胃酸和胃内容物逆流至咽喉部时，会刺激咽喉黏膜，导致慢性咽炎。
            </p>
            <div className="highlight-box">
              <h4>主要特征</h4>
              <ul>
                <li><strong>反流性咽喉炎（LPR）</strong>：胃酸反流至咽喉部位</li>
                <li><strong>症状持续性</strong>：通常症状持续3个月以上</li>
                <li><strong>黏膜损伤</strong>：咽喉黏膜受到反复刺激和损伤</li>
                <li><strong>双重机制</strong>：直接刺激和间接炎症反应</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 病因分析 */}
        <section className="medical-section">
          <h3 className="section-title">
            <span className="icon">🔬</span>
            病因分析
          </h3>
          <div className="section-content">
            <div className="cause-grid">
              <div className="cause-card">
                <h4>🔓 食管下括约肌功能障碍</h4>
                <p>食管下括约肌（LES）松弛或压力降低，无法有效防止胃内容物反流</p>
              </div>
              <div className="cause-card">
                <h4>⚡ 食管蠕动功能减弱</h4>
                <p>食管清除反流物能力下降，导致酸性物质在咽喉部停留时间延长</p>
              </div>
              <div className="cause-card">
                <h4>🍔 饮食生活习惯</h4>
                <p>高脂饮食、暴饮暴食、餐后立即平卧、吸烟饮酒等不良习惯</p>
              </div>
              <div className="cause-card">
                <h4>😰 精神压力因素</h4>
                <p>焦虑、抑郁等情绪问题可能加重胃食管反流症状</p>
              </div>
              <div className="cause-card">
                <h4>💊 药物影响</h4>
                <p>某些药物（如抗胆碱能药、钙通道阻滞剂）可能降低LES压力</p>
              </div>
              <div className="cause-card">
                <h4>⚖️ 肥胖因素</h4>
                <p>腹压增高导致胃内压力升高，增加反流风险</p>
              </div>
            </div>
          </div>
        </section>

        {/* 症状表现 */}
        <section className="medical-section">
          <h3 className="section-title">
            <span className="icon">🩺</span>
            症状表现
          </h3>
          <div className="section-content">
            <div className="symptoms-grid">
              <div className="symptom-category">
                <h4 className="symptom-title">典型症状</h4>
                <ul className="symptom-list">
                  <li>持续性咽部异物感</li>
                  <li>咽喉干燥、灼热感</li>
                  <li>晨起咳嗽、清嗓</li>
                  <li>声音嘶哑</li>
                  <li>吞咽不适</li>
                </ul>
              </div>
              <div className="symptom-category">
                <h4 className="symptom-title">反流症状</h4>
                <ul className="symptom-list">
                  <li>反酸、烧心</li>
                  <li>胸骨后疼痛</li>
                  <li>餐后症状加重</li>
                  <li>夜间症状明显</li>
                  <li>平卧时加重</li>
                </ul>
              </div>
              <div className="symptom-category">
                <h4 className="symptom-title">伴随症状</h4>
                <ul className="symptom-list">
                  <li>慢性咳嗽</li>
                  <li>哮喘样症状</li>
                  <li>口臭</li>
                  <li>牙齿腐蚀</li>
                  <li>睡眠质量下降</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 治疗方法 */}
        <section className="medical-section">
          <h3 className="section-title">
            <span className="icon">💊</span>
            治疗方法
          </h3>
          <div className="section-content">
            <div className="treatment-section">
              <h4 className="treatment-subtitle">🔹 药物治疗</h4>
              <div className="medication-grid">
                <div className="medication-card">
                  <h5>质子泵抑制剂（PPI）</h5>
                  <p className="drug-examples">如：奥美拉唑、兰索拉唑、雷贝拉唑、艾司奥美拉唑</p>
                  <p className="drug-desc">最有效的抑酸药物，标准剂量每日1-2次，疗程8-12周</p>
                  <div className="drug-note">
                    <strong>注意：</strong>需在餐前30-60分钟服用，长期使用需医生指导
                  </div>
                </div>
                <div className="medication-card">
                  <h5>H2受体拮抗剂</h5>
                  <p className="drug-examples">如：法莫替丁、雷尼替丁</p>
                  <p className="drug-desc">抑酸作用较PPI弱，可用于轻症或PPI补充治疗</p>
                </div>
                <div className="medication-card">
                  <h5>黏膜保护剂</h5>
                  <p className="drug-examples">如：铝碳酸镁、硫糖铝</p>
                  <p className="drug-desc">保护食管和咽喉黏膜，促进损伤修复</p>
                </div>
                <div className="medication-card">
                  <h5>促动力药</h5>
                  <p className="drug-examples">如：莫沙必利、伊托必利</p>
                  <p className="drug-desc">增强食管蠕动，加速胃排空，减少反流</p>
                </div>
                <div className="medication-card">
                  <h5>咽喉局部用药</h5>
                  <p className="drug-examples">如：咽喉含片、喷雾剂</p>
                  <p className="drug-desc">缓解咽喉局部症状，减轻不适感</p>
                </div>
              </div>
            </div>

            <div className="treatment-section">
              <h4 className="treatment-subtitle">🔹 手术治疗</h4>
              <p>适用于药物治疗无效或存在严重并发症的患者：</p>
              <ul>
                <li><strong>腹腔镜胃底折叠术：</strong>重建抗反流屏障，适合年轻、症状严重的患者</li>
                <li><strong>内镜下治疗：</strong>如射频消融、抗反流黏膜切除术等微创治疗</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 饮食建议 */}
        <section className="medical-section">
          <h3 className="section-title">
            <span className="icon">🍽️</span>
            饮食注意事项
          </h3>
          <div className="section-content">
            <div className="diet-grid">
              <div className="diet-card diet-avoid">
                <h4>❌ 应避免的食物</h4>
                <div className="food-category">
                  <h5>刺激性食物</h5>
                  <ul>
                    <li>辛辣食物（辣椒、花椒、咖喱等）</li>
                    <li>酸性食物（柠檬、醋、酸梅等）</li>
                    <li>过热或过冷的食物</li>
                  </ul>
                </div>
                <div className="food-category">
                  <h5>高脂食物</h5>
                  <ul>
                    <li>油炸食品</li>
                    <li>肥肉、动物内脏</li>
                    <li>奶油、黄油</li>
                    <li>高脂肪甜点</li>
                  </ul>
                </div>
                <div className="food-category">
                  <h5>易反流食物</h5>
                  <ul>
                    <li>巧克力</li>
                    <li>薄荷</li>
                    <li>咖啡、浓茶</li>
                    <li>碳酸饮料</li>
                    <li>酒精类饮品</li>
                  </ul>
                </div>
                <div className="food-category">
                  <h5>其他</h5>
                  <ul>
                    <li>番茄及番茄制品</li>
                    <li>柑橘类水果</li>
                    <li>洋葱、大蒜（生食）</li>
                  </ul>
                </div>
              </div>

              <div className="diet-card diet-recommend">
                <h4>✅ 推荐的食物</h4>
                <div className="food-category">
                  <h5>主食类</h5>
                  <ul>
                    <li>软烂的米粥、面条</li>
                    <li>馒头、面包（非油炸）</li>
                    <li>燕麦、小米</li>
                  </ul>
                </div>
                <div className="food-category">
                  <h5>蛋白质</h5>
                  <ul>
                    <li>瘦肉（鸡肉、鱼肉）</li>
                    <li>鸡蛋（煮、蒸）</li>
                    <li>豆腐、豆制品</li>
                  </ul>
                </div>
                <div className="food-category">
                  <h5>蔬菜类</h5>
                  <ul>
                    <li>绿叶蔬菜（菠菜、油菜等）</li>
                    <li>南瓜、胡萝卜</li>
                    <li>山药、土豆</li>
                    <li>西兰花、芦笋</li>
                  </ul>
                </div>
                <div className="food-category">
                  <h5>水果类</h5>
                  <ul>
                    <li>香蕉</li>
                    <li>苹果（煮熟）</li>
                    <li>木瓜</li>
                    <li>梨（煮熟）</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="diet-tips">
              <h4>🔸 饮食习惯建议</h4>
              <ul className="tips-list">
                <li><strong>少量多餐：</strong>每餐七分饱，避免过度饱胀</li>
                <li><strong>细嚼慢咽：</strong>充分咀嚼，减轻消化负担</li>
                <li><strong>餐后活动：</strong>餐后至少2-3小时后再平卧</li>
                <li><strong>睡前禁食：</strong>睡前3小时内不进食</li>
                <li><strong>饮水方式：</strong>小口饮水，避免大量喝水</li>
                <li><strong>食物温度：</strong>食物温度适中，避免过冷或过热</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 生活方式调整 */}
        <section className="medical-section">
          <h3 className="section-title">
            <span className="icon">🏃</span>
            生活方式调整
          </h3>
          <div className="section-content">
            <div className="lifestyle-grid">
              <div className="lifestyle-card">
                <h4>🛏️ 睡眠姿势</h4>
                <ul>
                  <li>抬高床头15-20cm</li>
                  <li>左侧卧位睡眠</li>
                  <li>避免右侧卧和俯卧</li>
                  <li>使用合适高度的枕头</li>
                </ul>
              </div>
              <div className="lifestyle-card">
                <h4>⚖️ 体重管理</h4>
                <ul>
                  <li>控制体重在正常范围</li>
                  <li>减轻腹部压力</li>
                  <li>适度有氧运动</li>
                  <li>避免剧烈运动</li>
                </ul>
              </div>
              <div className="lifestyle-card">
                <h4>👔 衣着选择</h4>
                <ul>
                  <li>穿着宽松舒适</li>
                  <li>避免紧身衣裤</li>
                  <li>不系紧腰带</li>
                  <li>减少腹部压迫</li>
                </ul>
              </div>
              <div className="lifestyle-card">
                <h4>🚭 戒除不良习惯</h4>
                <ul>
                  <li>戒烟</li>
                  <li>限制饮酒</li>
                  <li>避免浓茶、咖啡</li>
                  <li>规律作息</li>
                </ul>
              </div>
              <div className="lifestyle-card">
                <h4>😌 情绪管理</h4>
                <ul>
                  <li>保持心情舒畅</li>
                  <li>学习减压技巧</li>
                  <li>避免过度焦虑</li>
                  <li>适当放松训练</li>
                </ul>
              </div>
              <div className="lifestyle-card">
                <h4>💊 用药注意</h4>
                <ul>
                  <li>避免刺激性药物</li>
                  <li>遵医嘱规律服药</li>
                  <li>不随意停药</li>
                  <li>注意药物副作用</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 前沿研究 */}
        <section className="medical-section">
          <h3 className="section-title">
            <span className="icon">🔬</span>
            前沿研究与新进展
          </h3>
          <div className="section-content">
            <div className="research-items">
              <div className="research-item">
                <h4>🧬 微生物组研究</h4>
                <p>
                  研究发现，食管和咽喉部微生物群失衡可能与反流性咽喉炎的发生发展有关。
                  益生菌治疗可能成为辅助治疗的新方向。
                </p>
              </div>
              <div className="research-item">
                <h4>🎯 靶向治疗</h4>
                <p>
                  新型钾离子竞争性酸阻滞剂（P-CAB）如伏诺拉生，相比传统PPI起效更快，
                  抑酸作用更强，为难治性病例提供新选择。
                </p>
              </div>
              <div className="research-item">
                <h4>🔍 精准诊断</h4>
                <p>
                  24小时pH-阻抗监测技术的改进，能更准确地检测非酸性反流和气体反流，
                  提高诊断的准确性和个体化治疗方案的制定。
                </p>
              </div>
              <div className="research-item">
                <h4>🤖 AI辅助诊疗</h4>
                <p>
                  人工智能技术在内镜检查图像识别、症状预测和治疗方案优化方面的应用，
                  有望提高诊疗效率和准确性。
                </p>
              </div>
              <div className="research-item">
                <h4>💉 生物制剂</h4>
                <p>
                  针对食管黏膜屏障功能的生物制剂研究正在进行中，
                  可能为修复黏膜损伤提供新的治疗途径。
                </p>
              </div>
              <div className="research-item">
                <h4>🧘 整合医学</h4>
                <p>
                  中西医结合治疗、针灸、推拿等传统疗法在改善症状、
                  调节胃肠功能方面显示出一定疗效，值得进一步研究。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 预后与随访 */}
        <section className="medical-section">
          <h3 className="section-title">
            <span className="icon">📈</span>
            预后与随访
          </h3>
          <div className="section-content">
            <div className="prognosis-box">
              <h4>整体预后</h4>
              <p>
                胃食管反流导致的慢性咽炎经过规范治疗和生活方式调整，大多数患者症状可以得到有效控制。
                但这是一种慢性疾病，需要长期管理。
              </p>
            </div>
            <div className="followup-schedule">
              <h4>随访建议</h4>
              <ul>
                <li><strong>初期（前3个月）：</strong>每4-6周复诊一次，评估治疗效果</li>
                <li><strong>稳定期：</strong>每3-6个月复诊，监测症状变化</li>
                <li><strong>长期维持：</strong>每年进行胃镜检查，排除并发症</li>
                <li><strong>症状加重时：</strong>及时就医，调整治疗方案</li>
              </ul>
            </div>
            <div className="warning-signs">
              <h4>⚠️ 需要警惕的症状</h4>
              <ul className="warning-list">
                <li>吞咽困难加重或疼痛</li>
                <li>不明原因体重下降</li>
                <li>持续性胸痛</li>
                <li>呕血或黑便</li>
                <li>声音嘶哑持续不缓解</li>
              </ul>
              <p className="warning-note">
                出现以上症状应及时就医，排除食管炎、Barrett食管、食管癌等严重并发症。
              </p>
            </div>
          </div>
        </section>

        {/* 康复建议 */}
        <section className="medical-section">
          <h3 className="section-title">
            <span className="icon">💪</span>
            康复与自我管理
          </h3>
          <div className="section-content">
            <div className="recovery-tips">
              <div className="tip-box">
                <h4>📝 症状日记</h4>
                <p>记录每日症状、饮食、用药情况，帮助识别诱发因素，调整治疗方案。</p>
              </div>
              <div className="tip-box">
                <h4>🎯 设定目标</h4>
                <p>制定阶段性康复目标，如减少夜间反流次数、改善睡眠质量等。</p>
              </div>
              <div className="tip-box">
                <h4>👨‍⚕️ 医患沟通</h4>
                <p>与医生保持良好沟通，及时反馈治疗效果和副作用，共同调整方案。</p>
              </div>
              <div className="tip-box">
                <h4>📚 健康教育</h4>
                <p>学习相关知识，了解疾病机制和管理方法，提高自我管理能力。</p>
              </div>
              <div className="tip-box">
                <h4>🤝 社会支持</h4>
                <p>寻求家人朋友的理解和支持，必要时参加患者互助小组。</p>
              </div>
              <div className="tip-box">
                <h4>✨ 保持乐观</h4>
                <p>保持积极心态，相信通过规范治疗和自我管理可以有效控制疾病。</p>
              </div>
            </div>
          </div>
        </section>

        {/* 免责声明 */}
        <div className="disclaimer">
          <h4>⚕️ 医学免责声明</h4>
          <p>
            本页面提供的信息仅供参考和教育目的，不能替代专业医疗建议、诊断或治疗。
            任何健康问题都应咨询合格的医疗专业人员。请勿仅根据本页面信息自行诊断或治疗。
            如有疑问或症状加重，请及时就医。
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
