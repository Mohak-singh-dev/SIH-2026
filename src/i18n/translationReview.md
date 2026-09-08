# MindCare NER — Multilingual Translation Quality & Verification Registry

This document tracks translation quality, terminology decisions, and strings marked for clinical and native-speaker verification across the 10 supported patient languages.

---

## 1. Supported Languages & Dialects

| Code | Language | Native Script Name | Primary Region | Script Type |
| :--- | :--- | :--- | :--- | :--- |
| `en` | **English** | English | International / Pan-India | Latin |
| `hi` | **Hindi** | हिन्दी | Pan-India | Devanagari |
| `as` | **Assamese** | অসমীয়া | Assam / Brahmaputra Valley | Eastern Nagari (Bengali-Assamese) |
| `bn` | **Bengali** | বাংলা | Assam (Barak Valley), Tripura, Bengal | Eastern Nagari (Bengali) |
| `mni` | **Meitei / Manipuri** | মৈতৈলোন / Manipuri | Manipur | Bengali / Meetei Mayek |
| `kha` | **Khasi** | Ka Ktien Khasi | Meghalaya (Khasi & Jaintia Hills) | Latin |
| `lus` | **Mizo** | Mizo ṭawng | Mizoram | Latin |
| `grt` | **Garo** | A·chik | Meghalaya (Garo Hills), Assam | Latin |
| `brx` | **Bodo** | बड़ो | Assam (Bodoland BTC) | Devanagari |
| `trp` | **Kokborok** | Kokborok | Tripura | Latin / Bengali |

---

## 2. Core Translation Principles for Dementia Patients

1. **Short, Calming Sentences**: Avoid complex subordinate clauses that burden working memory.
2. **Everyday Vocabulary**: Use familiar, reassuring terms rather than medical jargon.
3. **Absolute Non-Translation of Critical Safety Data**:
   - Emergency helpline number `112` is invariant across all languages.
   - User phone numbers and caregiver phone numbers remain verbatim.
   - GPS latitude and longitude numerical coordinates remain unmodified.
4. **Cognitive Integrity Preservation**:
   - In cognitive memory games (Word Recall), test words are not machine-translated on the fly. Each language uses familiar everyday concepts (e.g. water, tree, sun, mango, bird).

---

## 3. Safety-Critical Strings Marked for Native-Speaker Verification

The following safety-critical phrases have been translated with simple, culturally appropriate terminology and are flagged here for human native-speaker review prior to large-scale clinical deployment:

### Phrase 1: SOS / Emergency Safety Notice
- **English**: *"If you are lost or feel unsafe, stay in a public place and call your caregiver or 112 immediately."*
- **Hindi**: `"यदि आप भटक गए हैं या असुरक्षित महसूस कर रहे हैं, तो किसी सुरक्षित सार्वजनिक स्थान पर रहें और तुरंत अपने देखभालकर्ता या 112 पर कॉल करें।"`
- **Assamese**: `"যদি আপুনি বাট হেৰুৱাইছে বা ভয় খাইছে, কোনো ৰাজহুৱা স্থানত ৰওক আৰু ততাতৈয়াকৈ আপোনাৰ যত্নকৰ্তা বা ১১২ নম্বৰত ফোন কৰক।"`
- **Bengali**: `"যদি আপনি পথ হারিয়ে ফেলেন বা অনিরাপদ বোধ করেন, তবে কোনো নিরাপদ জনবহুল স্থানে থাকুন এবং অবিলম্বে আপনার সেবাদানকারী বা ১১২ নম্বরে কল করুন।"`
- **Meitei/Manipuri**: `"করিগুম্বা নহাক লম্বী মাঙলবা নত্রগা মীপাইনবা পোক্লবা, মীয়াম লৈবা মফম অমদা লেপ্পু অমসুং য়েংশিনবীবা মীওই নত্রগা ১১২ দা কোল তৌবিউ।"`
- **Khasi**: `"Lada phew jah lynti lane shepting, shong ha jaka paidbah bad khot wut-wut ïa u nongsumar lane 112."`
- **Mizo**: `"I bo emaw, him lo anga i inhriat chuan, mi tamna hmunah lo awm la, i enkawltu emaw 112 emaw be vat rawh."`
- **Garo**: `"Gimae galengoba ba kenani ong·oba, jinma dongramo dongbo aro ni·rokgipana ba 112-na ta·raken ka·bo."`
- **Bodo**: `"नोंथाङा लामा गोमादों एबा गिख्रोंदोंब्ला, सुबुं थानाय जायगायाव था आरो थाबैनो नायदिंफाया एबा ११२ आव कल खालाम।"`
- **Kokborok**: `"Nwng lama kma khei eba kiphil khei, borok bangmani thaimio tongdi tei nini nai-phanono eba 112-no khwlaidi."`

### Phrase 2: Medicine Due Reminder
- **English**: *"Time for your scheduled medicine"*
- **Hindi**: `"आपकी निर्धारित दवा लेने का समय हो गया है"`
- **Assamese**: `"ঔষধ খোৱাৰ সময় হৈছে"`
- **Bengali**: `"আপনার নির্ধারিত ওষুধ খাওয়ার সময় হয়েছে"`
- **Meitei/Manipuri**: `"হিদাক চাবগী মতম ওইরে"`
- **Khasi**: `"Por ban dih dawai mynta"`
- **Mizo**: `"Damdawi ei a hun ta e"`
- **Garo**: `"Sam ringna somoi ong·aha"`
- **Bodo**: `"मुलि लोंनायनि सम जाबाय"`
- **Kokborok**: `"Bwswk nungna somoi ongkha"`

---

## 4. Status
All 10 bundled JSON dictionaries are verified 100% complete with 0 missing keys.
Fallback chain: Any missing key automatically falls back to English without exposing technical code keys.
