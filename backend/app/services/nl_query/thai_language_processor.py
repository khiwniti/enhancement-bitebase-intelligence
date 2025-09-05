"""
Thai Language Processor for Natural Language Queries

This module handles Thai language processing for restaurant analytics queries,
providing natural Thai responses that sound like a Thai person would speak.
"""

import re
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class ThaiQueryContext:
    """Context for Thai language queries"""
    intent: str
    entities: Dict[str, any]
    politeness_level: str  # "formal", "polite", "casual"
    time_context: Optional[str] = None
    location_context: Optional[str] = None

class ThaiLanguageProcessor:
    """
    Processes Thai natural language queries and generates appropriate Thai responses
    for restaurant analytics with culturally appropriate language patterns.
    """
    
    def __init__(self):
        self.thai_intent_patterns = {
            "sales_inquiry": [
                r"ยอดขาย|รายได้|กำไร|เงิน",
                r"ขายได้|ได้เท่าไหร่|รายรับ",
                r"ธุรกิจเป็นยังไง|กิจการเป็นไง"
            ],
            "customer_analysis": [
                r"ลูกค้า|คน|ผู้บริโภค|นักท่องเที่ยว",
                r"มาทาน|มาซื้อ|มาใช้บริการ",
                r"ความพึงพอใจ|รีวิว|คะแนน"
            ],
            "menu_performance": [
                r"เมนู|อาหาร|เครื่องดื่ม|ของหวาน",
                r"ขายดี|ขายไม่ดี|นิยม|ไม่นิยม",
                r"สั่งเยอะ|สั่งน้อย|สั่งบ่อย"
            ],
            "time_analysis": [
                r"เวลา|ช่วง|วัน|เดือน|ปี",
                r"วันนี้|เมื่อวาน|สัปดาห์|เดือน",
                r"ช่วงเช้า|ช่วงบ่าย|ช่วงเย็น|กลางคืน"
            ],
            "comparison": [
                r"เทียบ|เปรียบเทียบ|ต่างกัน",
                r"ดีกว่า|แย่กว่า|เท่ากัน",
                r"ขายดีกว่า|ได้น้อยกว่า"
            ]
        }
        
        self.thai_entities = {
            "time_periods": {
                "วันนี้": "today",
                "เมื่อวาน": "yesterday", 
                "สัปดาห์นี้": "this_week",
                "เดือนนี้": "this_month",
                "ปีนี้": "this_year",
                "ช่วงเช้า": "morning",
                "ช่วงบ่าย": "afternoon",
                "ช่วงเย็น": "evening",
                "กลางคืน": "night"
            },
            "metrics": {
                "ยอดขาย": "sales",
                "รายได้": "revenue",
                "กำไร": "profit",
                "ลูกค้า": "customers",
                "คำสั่งซื้อ": "orders",
                "เมนู": "menu_items"
            },
            "food_categories": {
                "อาหาร": "food",
                "เครื่องดื่ม": "drinks",
                "ของหวาน": "desserts",
                "อาหารจานหลัก": "main_dishes",
                "อาหารเรียกน้ำย่อย": "appetizers"
            }
        }
        
        self.thai_responses = {
            "greeting": [
                "สวัสดีค่ะ ยินดีช่วยเหลือในการวิเคราะห์ข้อมูลร้านอาหารของคุณค่ะ",
                "สวัสดีครับ มีอะไรให้ช่วยวิเคราะห์ข้อมูลร้านค่ะ",
                "ยินดีค่ะ อยากทราบข้อมูลอะไรเกี่ยวกับร้านบ้างคะ"
            ],
            "sales_positive": [
                "ยอดขายช่วงนี้ดีมากเลยค่ะ",
                "รายได้เพิ่มขึ้นน่าพอใจมากค่ะ",
                "ธุรกิจเติบโตได้ดีจริง ๆ ค่ะ"
            ],
            "sales_negative": [
                "ยอดขายช่วงนี้ลดลงไปหน่อยค่ะ",
                "รายได้ไม่ค่อยดีเท่าที่ควรค่ะ",
                "อาจต้องหาวิธีกระตุ้นยอดขายเพิ่มค่ะ"
            ],
            "clarification": [
                "ขออธิบายเพิ่มเติมหน่อยค่ะ คุณต้องการทราบข้อมูลเฉพาะช่วงไหนคะ",
                "อยากทราบเรื่องอะไรเพิ่มเติมคะ",
                "มีข้อมูลไหนที่อยากดูเพิ่มเติมไหมคะ"
            ]
        }

    def detect_language(self, text: str) -> str:
        """Detect if the input text is Thai or English"""
        # Count Thai characters (Unicode range for Thai)
        thai_chars = len(re.findall(r'[\u0E00-\u0E7F]', text))
        total_chars = len(re.sub(r'\s+', '', text))
        
        if total_chars == 0:
            return "unknown"
        
        thai_ratio = thai_chars / total_chars
        return "thai" if thai_ratio > 0.3 else "english"

    def extract_thai_intent(self, text: str) -> str:
        """Extract intent from Thai text"""
        text = text.lower()
        
        for intent, patterns in self.thai_intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text):
                    return intent
        
        return "general_inquiry"

    def extract_thai_entities(self, text: str) -> Dict[str, any]:
        """Extract entities from Thai text"""
        entities = {}
        text = text.lower()
        
        # Extract time periods
        for thai_time, english_time in self.thai_entities["time_periods"].items():
            if thai_time in text:
                entities["time_period"] = english_time
                entities["thai_time"] = thai_time
        
        # Extract metrics
        for thai_metric, english_metric in self.thai_entities["metrics"].items():
            if thai_metric in text:
                entities["metric"] = english_metric
                entities["thai_metric"] = thai_metric
        
        # Extract food categories
        for thai_food, english_food in self.thai_entities["food_categories"].items():
            if thai_food in text:
                entities["food_category"] = english_food
                entities["thai_food_category"] = thai_food
        
        return entities

    def determine_politeness_level(self, text: str) -> str:
        """Determine appropriate politeness level based on input"""
        # Check for formal indicators
        formal_indicators = ["กรุณา", "โปรด", "ขอ", "ได้โปรด", "อยากทราบ"]
        polite_indicators = ["ครับ", "ค่ะ", "คะ", "หน่อย", "บ้าง"]
        
        if any(indicator in text for indicator in formal_indicators):
            return "formal"
        elif any(indicator in text for indicator in polite_indicators):
            return "polite"
        else:
            return "casual"

    def process_thai_query(self, query: str) -> ThaiQueryContext:
        """Process Thai query and return context"""
        intent = self.extract_thai_intent(query)
        entities = self.extract_thai_entities(query)
        politeness = self.determine_politeness_level(query)
        
        return ThaiQueryContext(
            intent=intent,
            entities=entities,
            politeness_level=politeness
        )

    def generate_thai_response(self, context: ThaiQueryContext, data: Dict) -> str:
        """Generate natural Thai response based on context and data"""
        
        if context.intent == "sales_inquiry":
            return self._generate_sales_response(context, data)
        elif context.intent == "customer_analysis":
            return self._generate_customer_response(context, data)
        elif context.intent == "menu_performance":
            return self._generate_menu_response(context, data)
        elif context.intent == "time_analysis":
            return self._generate_time_response(context, data)
        elif context.intent == "comparison":
            return self._generate_comparison_response(context, data)
        else:
            return self._generate_general_response(context, data)

    def _generate_sales_response(self, context: ThaiQueryContext, data: Dict) -> str:
        """Generate Thai response for sales inquiries"""
        if not data:
            return "ขออภัยค่ะ ไม่มีข้อมูลยอดขายในช่วงเวลานี้"
        
        sales = data.get('sales', 0)
        time_period = context.entities.get('thai_time', 'ช่วงที่เลือก')
        
        if sales > 0:
            return f"ยอดขาย{time_period}อยู่ที่ {sales:,.0f} บาทค่ะ ถือว่าดีมากเลยนะคะ"
        else:
            return f"ยอดขาย{time_period}ยังไม่มีข้อมูลค่ะ"

    def _generate_customer_response(self, context: ThaiQueryContext, data: Dict) -> str:
        """Generate Thai response for customer analysis"""
        if not data:
            return "ขออภัยค่ะ ไม่มีข้อมูลลูกค้าในช่วงเวลานี้"
        
        customers = data.get('customer_count', 0)
        time_period = context.entities.get('thai_time', 'ช่วงที่เลือก')
        
        return f"มีลูกค้ามาใช้บริการ{time_period}ทั้งหมด {customers} คนค่ะ"

    def _generate_menu_response(self, context: ThaiQueryContext, data: Dict) -> str:
        """Generate Thai response for menu performance"""
        if not data:
            return "ขออภัยค่ะ ไม่มีข้อมูลเมนูในช่วงเวลานี้"
        
        top_items = data.get('top_items', [])
        if top_items:
            items_str = ", ".join(top_items[:3])
            return f"เมนูที่ขายดีที่สุดคือ {items_str} ค่ะ"
        else:
            return "ยังไม่มีข้อมูลเมนูที่ขายดีค่ะ"

    def _generate_time_response(self, context: ThaiQueryContext, data: Dict) -> str:
        """Generate Thai response for time analysis"""
        if not data:
            return "ขออภัยค่ะ ไม่มีข้อมูลในช่วงเวลาที่ต้องการ"
        
        return "นี่คือข้อมูลตามช่วงเวลาที่ต้องการค่ะ"

    def _generate_comparison_response(self, context: ThaiQueryContext, data: Dict) -> str:
        """Generate Thai response for comparisons"""
        if not data:
            return "ขออภัยค่ะ ไม่มีข้อมูลเพียงพอสำหรับการเปรียบเทียบ"
        
        return "นี่คือผลการเปรียบเทียบค่ะ"

    def _generate_general_response(self, context: ThaiQueryContext, data: Dict) -> str:
        """Generate general Thai response"""
        return "ยินดีช่วยเหลือค่ะ มีข้อมูลอะไรเพิ่มเติมที่อยากทราบไหมคะ"

    def format_numbers_thai(self, number: float) -> str:
        """Format numbers in Thai style"""
        if number >= 1000000:
            return f"{number/1000000:.1f} ล้าน"
        elif number >= 1000:
            return f"{number/1000:.1f} พัน"
        else:
            return f"{number:,.0f}"

    def get_thai_greeting(self) -> str:
        """Get a random Thai greeting"""
        import random
        return random.choice(self.thai_responses["greeting"])
    
    def add_thai_politeness_markers(self, response: str, politeness_level: str) -> str:
        """Add appropriate Thai politeness markers to response"""
        import random
        
        if politeness_level == "formal":
            # Add formal politeness markers
            if response.endswith("ค่ะ") or response.endswith("ครับ"):
                return response
            elif "?" in response:
                return response.replace("?", " ไหมครับ/ค่ะ?")
            else:
                return response + " ครับ/ค่ะ"
        
        elif politeness_level == "casual":
            # Add casual but polite markers
            casual_endings = ["นะ", "น่ะ", "เลย", "แหละ"]
            if not any(response.endswith(ending) for ending in casual_endings):
                return response + random.choice([" นะ", " นะครับ", " นะคะ"])
            return response
        
        elif politeness_level == "very_formal":
            # Add very formal markers
            formal_replacements = {
                "คุณ": "ท่าน",
                "ได้": "ได้โปรด",
                "ต้องการ": "ประสงค์"
            }
            for formal, replacement in formal_replacements.items():
                response = response.replace(formal, replacement)
            if not response.endswith("ครับ") and not response.endswith("ค่ะ"):
                return response + " ครับ/ค่ะ"
        
        return response
    
    def add_thai_conversational_elements(self, response: str, context: ThaiQueryContext) -> str:
        """Add natural Thai conversational elements"""
        import random
        
        # Add conversational connectors
        connectors = {
            "แล้วก็": "และ",
            "นอกจากนี้": "และ",
            "อีกทั้ง": "และ"
        }
        
        # Add empathy expressions
        empathy_phrases = [
            "เข้าใจความรู้สึกนะคะ",
            "สำคัญมากเลยนะคะ",
            "ดีใจด้วยนะคะ",
            "น่าสนใจมากเลย"
        ]
        
        # Add follow-up suggestions based on intent
        if context.intent in ["sales_inquiry", "revenue_analysis"]:
            followup_suggestions = [
                " หากต้องการดูรายละเอียดเพิ่มเติม สามารถบอกได้นะคะ",
                " อยากจะวิเคราะห์ข้อมูลเพิ่มเติมไหมคะ?",
                " มีข้อมูลช่วงเวลาอื่นที่อยากเปรียบเทียบไหมคะ?"
            ]
            response += random.choice(followup_suggestions)
        
        return response
    
    def format_thai_business_response(self, data: Dict, intent: str) -> str:
        """Format data into natural Thai business language"""
        if intent == "sales_inquiry":
            sales = data.get('sales', 0)
            if sales > 100000:
                return f"ยอดขายดีมากเลยนะคะ อยู่ที่ {self.format_numbers_thai(sales)} บาท"
            elif sales > 50000:
                return f"ยอดขายพอใช้ได้นะคะ อยู่ที่ {self.format_numbers_thai(sales)} บาท"
            else:
                return f"ยอดขายยังน้อยไปหน่อยนะคะ อยู่ที่ {self.format_numbers_thai(sales)} บาท"
        
        elif intent == "customer_analysis":
            customers = data.get('customers', 0)
            if customers > 100:
                return f"ลูกค้ามาเยอะมากเลยนะคะ ทั้งหมด {customers} คน"
            elif customers > 50:
                return f"ลูกค้ามาพอสมควรนะคะ ทั้งหมด {customers} คน"
            else:
                return f"ลูกค้ายังมาไม่เยอะนะคะ ทั้งหมด {customers} คน"
        
        return "ข้อมูลตามที่ได้รับมานะคะ"
    
    def generate_thai_insights(self, data: Dict, context: ThaiQueryContext) -> List[str]:
        """Generate Thai language insights from data"""
        insights = []
        
        # Revenue insights
        if 'revenue' in data:
            revenue = data['revenue']
            if isinstance(revenue, list) and len(revenue) >= 2:
                if revenue[-1] > revenue[-2]:
                    insights.append("แนวโน้มรายได้เพิ่มขึ้นนะคะ เป็นสัญญาณที่ดี")
                elif revenue[-1] < revenue[-2]:
                    insights.append("รายได้ลดลงนิดหน่อยนะคะ อาจจะต้องดูสาเหตุ")
        
        # Customer insights  
        if 'customer_satisfaction' in data:
            satisfaction = data['customer_satisfaction']
            if satisfaction > 4.5:
                insights.append("คะแนนความพึงพอใจลูกค้าสูงมากเลยนะคะ เก่งมาก!")
            elif satisfaction > 3.5:
                insights.append("คะแนนความพึงพอใจลูกค้าดีนะคะ")
            else:
                insights.append("คะแนนความพึงพอใจลูกค้าต่ำไปหน่อยนะคะ อาจต้องปรับปรุง")
        
        return insights
    
    def add_thai_politeness_markers(self, response: str, politeness_level: str) -> str:
        """Add appropriate Thai politeness markers to response"""
        import random
        
        if politeness_level == "formal":
            # Add formal politeness markers
            if response.endswith("ค่ะ") or response.endswith("ครับ"):
                return response
            elif "?" in response:
                return response.replace("?", " ไหมครับ/ค่ะ?")
            else:
                return response + " ครับ/ค่ะ"
        
        elif politeness_level == "casual":
            # Add casual but polite markers
            casual_endings = ["นะ", "น่ะ", "เลย", "แหละ"]
            if not any(response.endswith(ending) for ending in casual_endings):
                return response + random.choice([" นะ", " นะครับ", " นะคะ"])
            return response
        
        elif politeness_level == "very_formal":
            # Add very formal markers
            formal_replacements = {
                "คุณ": "ท่าน",
                "ได้": "ได้โปรด",
                "ต้องการ": "ประสงค์"
            }
            for formal, replacement in formal_replacements.items():
                response = response.replace(formal, replacement)
            if not response.endswith("ครับ") and not response.endswith("ค่ะ"):
                return response + " ครับ/ค่ะ"
        
        return response
    
    def add_thai_conversational_elements(self, response: str, context: ThaiQueryContext) -> str:
        """Add natural Thai conversational elements"""
        import random
        
        # Add conversational connectors
        connectors = {
            "แล้วก็": "และ",
            "นอกจากนี้": "และ",
            "อีกทั้ง": "และ"
        }
        
        # Add empathy expressions
        empathy_phrases = [
            "เข้าใจความรู้สึกนะคะ",
            "สำคัญมากเลยนะคะ",
            "ดีใจด้วยนะคะ",
            "น่าสนใจมากเลย"
        ]
        
        # Add follow-up suggestions based on intent
        if context.intent in ["sales_inquiry", "revenue_analysis"]:
            followup_suggestions = [
                " หากต้องการดูรายละเอียดเพิ่มเติม สามารถบอกได้นะคะ",
                " อยากจะวิเคราะห์ข้อมูลเพิ่มเติมไหมคะ?",
                " มีข้อมูลช่วงเวลาอื่นที่อยากเปรียบเทียบไหมคะ?"
            ]
            response += random.choice(followup_suggestions)
        
        return response
    
    def format_thai_business_response(self, data: Dict, intent: str) -> str:
        """Format data into natural Thai business language"""
        if intent == "sales_inquiry":
            sales = data.get('sales', 0)
            if sales > 100000:
                return f"ยอดขายดีมากเลยนะคะ อยู่ที่ {self.format_numbers_thai(sales)} บาท"
            elif sales > 50000:
                return f"ยอดขายพอใช้ได้นะคะ อยู่ที่ {self.format_numbers_thai(sales)} บาท"
            else:
                return f"ยอดขายยังน้อยไปหน่อยนะคะ อยู่ที่ {self.format_numbers_thai(sales)} บาท"
        
        elif intent == "customer_analysis":
            customers = data.get('customers', 0)
            if customers > 100:
                return f"ลูกค้ามาเยอะมากเลยนะคะ ทั้งหมด {customers} คน"
            elif customers > 50:
                return f"ลูกค้ามาพอสมควรนะคะ ทั้งหมด {customers} คน"
            else:
                return f"ลูกค้ายังมาไม่เยอะนะคะ ทั้งหมด {customers} คน"
        
        return "ข้อมูลตามที่ได้รับมานะคะ"
    
    def generate_thai_insights(self, data: Dict, context: ThaiQueryContext) -> List[str]:
        """Generate Thai language insights from data"""
        insights = []
        
        # Revenue insights
        if 'revenue' in data:
            revenue = data['revenue']
            if isinstance(revenue, list) and len(revenue) >= 2:
                if revenue[-1] > revenue[-2]:
                    insights.append("แนวโน้มรายได้เพิ่มขึ้นนะคะ เป็นสัญญาณที่ดี")
                elif revenue[-1] < revenue[-2]:
                    insights.append("รายได้ลดลงนิดหน่อยนะคะ อาจจะต้องดูสาเหตุ")
        
        # Customer insights  
        if 'customer_satisfaction' in data:
            satisfaction = data['customer_satisfaction']
            if satisfaction > 4.5:
                insights.append("คะแนนความพึงพอใจลูกค้าสูงมากเลยนะคะ เก่งมาก!")
            elif satisfaction > 3.5:
                insights.append("คะแนนความพึงพอใจลูกค้าดีนะคะ")
            else:
                insights.append("คะแนนความพึงพอใจลูกค้าต่ำไปหน่อยนะคะ อาจต้องปรับปรุง")
        
        return insights
