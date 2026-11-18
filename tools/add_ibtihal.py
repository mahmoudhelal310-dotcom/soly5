#!/usr/bin/env python3
"""إضافة ابتهالات إلى فهرس الموقع.
الاستعمال:  python3 tools/add_ibtihal.py "الشيخ سيد النقشبندي" https://youtu.be/XXXXXXXXXXX https://www.youtube.com/watch?v=YYYYYYYYYYY
يجلب العنوان تلقائياً من يوتيوب (بدون مفتاح) ثم يضيفه إلى athr/ibtihal-data.js"""
import sys, re, json, urllib.request, urllib.parse
P = "athr/ibtihal-data.js"
if len(sys.argv) < 3: sys.exit(__doc__)
reciter, links = sys.argv[1], sys.argv[2:]
src = open(P, encoding="utf-8").read()
m = re.search(r"window\.IBTIHAL_DATA=(\[.*\]);", src, re.S)
data = json.loads(m.group(1)); have = {x["v"] for x in data}
for l in links:
    mm = re.search(r"(?:v=|youtu\.be/|embed/|shorts/)([\w-]{11})", l) or re.fullmatch(r"([\w-]{11})", l)
    if not mm: print("رابط غير مفهوم:", l); continue
    vid = mm.group(1)
    if vid in have: print("موجود:", vid); continue
    try:
        u = "https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote("https://www.youtube.com/watch?v=" + vid)
        title = json.load(urllib.request.urlopen(u, timeout=15))["title"]
    except Exception as e:
        title = input(f"تعذّر جلب العنوان لـ {vid}، اكتبه: ")
    data.append({"t": title, "r": reciter, "v": vid}); print("أضيف:", title)
head = src[:m.start()]
open(P, "w", encoding="utf-8").write(head + "window.IBTIHAL_DATA=" + json.dumps(data, ensure_ascii=False, indent=0) + ";\n")
