Run biome ci .
dws/server.js:49:25   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━

  ⚠ This parameter is unused.
  
    48 │ // Health check endpoint
  > 49 │ app.get('/api/health', (req, res) => {
       │                         ^^^
    50 │   res.json({ status: 'ok', message: 'Server is running' });
    51 │ });
  
  ℹ Unused parameters might be the result of an incomplete refactoring.
  
  ℹ Unsafe fix: If this is intentional, prepend req with an underscore.
  
     47  47 │   ␍
     48  48 │   // Health check endpoint␍
     49     │ - app.get('/api/health',·(req,·res)·=>·{␍
         49 │ + app.get('/api/health',·(_req,·res)·=>·{␍
     50  50 │     res.json({ status: 'ok', message: 'Server is running' });␍
     51  51 │   });␍
  

dws/server.js:317:34   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━

  ⚠ This parameter is unused.
  
    316 │ // Document management endpoints for cleanup
  > 317 │ app.get('/api/documents', async (req, res) => {
        │                                  ^^^
    318 │   try {
    319 │     const apiKey = process.env.NUTRIENT_DWS_VIEWER_API_KEY;
  
  ℹ Unused parameters might be the result of an incomplete refactoring.
  
  ℹ Unsafe fix: If this is intentional, prepend req with an underscore.
  
    315 315 │   ␍
    316 316 │   // Document management endpoints for cleanup␍
    317     │ - app.get('/api/documents',·async·(req,·res)·=>·{␍
        317 │ + app.get('/api/documents',·async·(_req,·res)·=>·{␍
    318 318 │     try {␍
    319 319 │       const apiKey = process.env.NUTRIENT_DWS_VIEWER_API_KEY;␍
  

dws/server.js:358:43   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━

  ⚠ This parameter is unused.
  
    356 │ });
    357 │ 
  > 358 │ app.post('/api/cleanup-documents', async (req, res) => {
        │                                           ^^^
    359 │   try {
    360 │     const apiKey = process.env.NUTRIENT_DWS_VIEWER_API_KEY;
  
  ℹ Unused parameters might be the result of an incomplete refactoring.
  
  ℹ Unsafe fix: If this is intentional, prepend req with an underscore.
  
    356 356 │   });␍
    357 357 │   ␍
    358     │ - app.post('/api/cleanup-documents',·async·(req,·res)·=>·{␍
        358 │ + app.post('/api/cleanup-documents',·async·(_req,·res)·=>·{␍
    359 359 │     try {␍
    360 360 │       const apiKey = process.env.NUTRIENT_DWS_VIEWER_API_KEY;␍
  

dws/eslint.config.js:1:1   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ The imports and exports are not sorted.
  
  > 1 │ import js from '@eslint/js'
      │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^
    2 │ import globals from 'globals'
    3 │ import react from 'eslint-plugin-react'
  
  ℹ Safe fix: Organize Imports (Biome)
  
     1  1 │   import js from '@eslint/js'␍
     2    │ - import·globals·from·'globals'␍
     3    │ - import·react·from·'eslint-plugin-react'␍
     4    │ - import·reactHooks·from·'eslint-plugin-react-hooks'␍
     5    │ - import·reactRefresh·from·'eslint-plugin-react-refresh'␍
        2 │ + import·react·from·'eslint-plugin-react'␍
        3 │ + import·reactHooks·from·'eslint-plugin-react-hooks'␍
        4 │ + import·reactRefresh·from·'eslint-plugin-react-refresh'␍
        5 │ + import·globals·from·'globals'␍
     6  6 │   ␍
     7  7 │   export default [␍
  

dws/eslint.config.js format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ File content differs from formatting output
  
     1    │ - import·js·from·'@eslint/js'␍
     2    │ - import·globals·from·'globals'␍
     3    │ - import·react·from·'eslint-plugin-react'␍
     4    │ - import·reactHooks·from·'eslint-plugin-react-hooks'␍
     5    │ - import·reactRefresh·from·'eslint-plugin-react-refresh'␍
     6    │ - ␍
     7    │ - export·default·[␍
     8    │ - ··{·ignores:·['dist']·},␍
     9    │ - ··{␍
    10    │ - ····files:·['**/*.{js,jsx}'],␍
    11    │ - ····languageOptions:·{␍
    12    │ - ······ecmaVersion:·2020,␍
    13    │ - ······globals:·globals.browser,␍
    14    │ - ······parserOptions:·{␍
    15    │ - ········ecmaVersion:·'latest',␍
    16    │ - ········ecmaFeatures:·{·jsx:·true·},␍
    17    │ - ········sourceType:·'module',␍
    18    │ - ······},␍
    19    │ - ····},␍
    20    │ - ····settings:·{·react:·{·version:·'18.3'·}·},␍
    21    │ - ····plugins:·{␍
    22    │ - ······react,␍
    23    │ - ······'react-hooks':·reactHooks,␍
    24    │ - ······'react-refresh':·reactRefresh,␍
    25    │ - ····},␍
    26    │ - ····rules:·{␍
    27    │ - ······...js.configs.recommended.rules,␍
    28    │ - ······...react.configs.recommended.rules,␍
    29    │ - ······...react.configs['jsx-runtime'].rules,␍
    30    │ - ······...reactHooks.configs.recommended.rules,␍
    31    │ - ······'react/jsx-no-target-blank':·'off',␍
    32    │ - ······'react-refresh/only-export-components':·[␍
    33    │ - ········'warn',␍
    34    │ - ········{·allowConstantExport:·true·},␍
    35    │ - ······],␍
    36    │ - ····},␍
    37    │ - ··},␍
    38    │ - ]
        1 │ + import·js·from·"@eslint/js";
        2 │ + import·globals·from·"globals";
        3 │ + import·react·from·"eslint-plugin-react";
        4 │ + import·reactHooks·from·"eslint-plugin-react-hooks";
        5 │ + import·reactRefresh·from·"eslint-plugin-react-refresh";
        6 │ + 
        7 │ + export·default·[
        8 │ + ··{·ignores:·["dist"]·},
        9 │ + ··{
       10 │ + ····files:·["**/*.{js,jsx}"],
       11 │ + ····languageOptions:·{
       12 │ + ······ecmaVersion:·2020,
       13 │ + ······globals:·globals.browser,
       14 │ + ······parserOptions:·{
       15 │ + ········ecmaVersion:·"latest",
       16 │ + ········ecmaFeatures:·{·jsx:·true·},
       17 │ + ········sourceType:·"module",
       18 │ + ······},
       19 │ + ····},
       20 │ + ····settings:·{·react:·{·version:·"18.3"·}·},
       21 │ + ····plugins:·{
       22 │ + ······react,
       23 │ + ······"react-hooks":·reactHooks,
       24 │ + ······"react-refresh":·reactRefresh,
       25 │ + ····},
       26 │ + ····rules:·{
       27 │ + ······...js.configs.recommended.rules,
       28 │ + ······...react.configs.recommended.rules,
       29 │ + ······...react.configs["jsx-runtime"].rules,
       30 │ + ······...reactHooks.configs.recommended.rules,
       31 │ + ······"react/jsx-no-target-blank":·"off",
       32 │ + ······"react-refresh/only-export-components":·[
       33 │ + ········"warn",
       34 │ + ········{·allowConstantExport:·true·},
       35 │ + ······],
       36 │ + ····},
       37 │ + ··},
       38 │ + ];
       39 │ + 
  

dws/package.json format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ File content differs from formatting output
  
     1    │ - {␍
     2    │ - ··"name":·"secure-pdf-viewer-table-extraction",␍
     3    │ - ··"private":·true,␍
     4    │ - ··"version":·"1.0.0",␍
     5    │ - ··"type":·"module",␍
     6    │ - ··"scripts":·{␍
     7    │ - ····"dev":·"vite",␍
     8    │ - ····"server":·"node·server.js",␍
     9    │ - ····"dev:full":·"concurrently·\"npm·run·server\"·\"npm·run·dev\"",␍
    10    │ - ····"build":·"tsc·-b·&&·vite·build",␍
    11    │ - ····"lint":·"eslint·.",␍
    12    │ - ····"preview":·"vite·preview"␍
    13    │ - ··},␍
    14    │ - ··"dependencies":·{␍
    15    │ - ····"@nutrient-sdk/viewer":·"^1.7.0",␍
    16    │ - ····"react":·"^19.1.0",␍
    17    │ - ····"react-dom":·"^19.1.0",␍
    18    │ - ····"react-icons":·"^5.5.0"␍
    19    │ - ··},␍
    20    │ - ··"devDependencies":·{␍
    21    │ - ····"@eslint/js":·"^9.25.0",␍
    22    │ - ····"@types/cors":·"^2.8.19",␍
    23    │ - ····"@types/express":·"^5.0.3",␍
    24    │ - ····"@types/multer":·"^2.0.0",␍
    25    │ - ····"@types/react":·"^19.1.2",␍
    26    │ - ····"@types/react-dom":·"^19.1.2",␍
    27    │ - ····"@vitejs/plugin-react":·"^4.4.1",␍
    28    │ - ····"concurrently":·"^8.2.2",␍
    29    │ - ····"cors":·"^2.8.5",␍
    30    │ - ····"dotenv":·"^16.4.5",␍
    31    │ - ····"eslint":·"^9.25.0",␍
    32    │ - ····"eslint-plugin-react-hooks":·"^5.2.0",␍
    33    │ - ····"eslint-plugin-react-refresh":·"^0.4.19",␍
    34    │ - ····"express":·"^4.19.2",␍
    35    │ - ····"form-data":·"^4.0.0",␍
    36    │ - ····"globals":·"^16.0.0",␍
    37    │ - ····"multer":·"^1.4.5-lts.1",␍
    38    │ - ····"node-fetch":·"^3.3.2",␍
    39    │ - ····"vite":·"^6.3.5"␍
    40    │ - ··}␍
    41    │ - }␍
        1 │ + {
        2 │ + ··"name":·"secure-pdf-viewer-table-extraction",
        3 │ + ··"private":·true,
        4 │ + ··"version":·"1.0.0",
        5 │ + ··"type":·"module",
        6 │ + ··"scripts":·{
        7 │ + ····"dev":·"vite",
        8 │ + ····"server":·"node·server.js",
        9 │ + ····"dev:full":·"concurrently·\"npm·run·server\"·\"npm·run·dev\"",
       10 │ + ····"build":·"tsc·-b·&&·vite·build",
       11 │ + ····"lint":·"eslint·.",
       12 │ + ····"preview":·"vite·preview"
       13 │ + ··},
       14 │ + ··"dependencies":·{
       15 │ + ····"@nutrient-sdk/viewer":·"^1.7.0",
       16 │ + ····"react":·"^19.1.0",
       17 │ + ····"react-dom":·"^19.1.0",
       18 │ + ····"react-icons":·"^5.5.0"
       19 │ + ··},
       20 │ + ··"devDependencies":·{
       21 │ + ····"@eslint/js":·"^9.25.0",
       22 │ + ····"@types/cors":·"^2.8.19",
       23 │ + ····"@types/express":·"^5.0.3",
       24 │ + ····"@types/multer":·"^2.0.0",
       25 │ + ····"@types/react":·"^19.1.2",
       26 │ + ····"@types/react-dom":·"^19.1.2",
       27 │ + ····"@vitejs/plugin-react":·"^4.4.1",
       28 │ + ····"concurrently":·"^8.2.2",
       29 │ + ····"cors":·"^2.8.5",
       30 │ + ····"dotenv":·"^16.4.5",
       31 │ + ····"eslint":·"^9.25.0",
       32 │ + ····"eslint-plugin-react-hooks":·"^5.2.0",
       33 │ + ····"eslint-plugin-react-refresh":·"^0.4.19",
       34 │ + ····"express":·"^4.19.2",
       35 │ + ····"form-data":·"^4.0.0",
       36 │ + ····"globals":·"^16.0.0",
       37 │ + ····"multer":·"^1.4.5-lts.1",
       38 │ + ····"node-fetch":·"^3.3.2",
       39 │ + ····"vite":·"^6.3.5"
       40 │ + ··}
       41 │ + }
    42 42 │   
  

dws/server.js:1:1   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ The imports and exports are not sorted.
  
  > 1 │ import express from 'express';
      │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    2 │ import cors from 'cors';
    3 │ import multer from 'multer';
  
  ℹ Safe fix: Organize Imports (Biome)
  
      1     │ - import·express·from·'express';␍
      2     │ - import·cors·from·'cors';␍
      3     │ - import·multer·from·'multer';␍
      4     │ - import·fetch·from·'node-fetch';␍
      5     │ - import·dotenv·from·'dotenv';␍
          1 │ + import·cors·from·'cors';␍
          2 │ + import·dotenv·from·'dotenv';
          3 │ + import·express·from·'express';␍
          4 │ + import·multer·from·'multer';␍
          5 │ + import·fetch·from·'node-fetch';␍
      6   6 │   ␍
      7   7 │   dotenv.config();␍
  

dws/src/App.css format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ File content differs from formatting output
  
      1     │ - .app·{␍
      2     │ - ··min-height:·100vh;␍
      3     │ - ··display:·flex;␍
      4     │ - ··flex-direction:·column;␍
      5     │ - ··background-color:·#f5f5f5;␍
      6     │ - }␍
      7     │ - ␍
      8     │ - .header·{␍
      9     │ - ··background:·linear-gradient(135deg,·#667eea·0%,·#764ba2·100%);␍
     10     │ - ··color:·white;␍
     11     │ - ··padding:·1rem;␍
     12     │ - ··text-align:·center;␍
     13     │ - ··box-shadow:·0·2px·4px·rgba(0,0,0,0.1);␍
     14     │ - }␍
     15     │ - ␍
     16     │ - .header·h1·{␍
     17     │ - ··margin:·0;␍
     18     │ - ··font-size:·1.8rem;␍
     19     │ - ··font-weight:·600;␍
     20     │ - }␍
     21     │ - ␍
     22     │ - .header·p·{␍
     23     │ - ··margin:·0.5rem·0·0·0;␍
     24     │ - ··opacity:·0.9;␍
     25     │ - ··font-size:·0.9rem;␍
     26     │ - }␍
     27     │ - ␍
     28     │ - .main-content·{␍
     29     │ - ··flex:·1;␍
     30     │ - ··display:·flex;␍
     31     │ - ··gap:·1rem;␍
     32     │ - ··padding:·1rem;␍
     33     │ - ··max-width:·1400px;␍
     34     │ - ··margin:·0·auto;␍
     35     │ - ··width:·100%;␍
     36     │ - }␍
     37     │ - ␍
     38     │ - .sidebar·{␍
     39     │ - ··width:·350px;␍
     40     │ - ··background:·white;␍
     41     │ - ··border-radius:·8px;␍
     42     │ - ··padding:·1.5rem;␍
     43     │ - ··box-shadow:·0·2px·8px·rgba(0,0,0,0.1);␍
     44     │ - ··height:·fit-content;␍
     45     │ - }␍
     46     │ - ␍
     47     │ - .upload-section·{␍
     48     │ - ··margin-bottom:·2rem;␍
     49     │ - }␍
     50     │ - ␍
     51     │ - .upload-section·h3·{␍
     52     │ - ··margin:·0·0·1rem·0;␍
     53     │ - ··color:·#333;␍
     54     │ - ··font-size:·1.1rem;␍
     55     │ - }␍
     56     │ - ␍
     57     │ - .upload-methods·{␍
     58     │ - ··display:·flex;␍
     59     │ - ··flex-direction:·column;␍
     60     │ - ··gap:·1rem;␍
     61     │ - }␍
     62     │ - ␍
     63     │ - .file-input-wrapper·{␍
     64     │ - ··position:·relative;␍
     65     │ - ··display:·inline-block;␍
     66     │ - ··width:·100%;␍
     67     │ - }␍
     68     │ - ␍
     69     │ - .file-input·{␍
     70     │ - ··position:·absolute;␍
     71     │ - ··opacity:·0;␍
     72     │ - ··width:·100%;␍
     73     │ - ··height:·100%;␍
     74     │ - ··cursor:·pointer;␍
     75     │ - }␍
     76     │ - ␍
     77     │ - .upload-button·{␍
     78     │ - ··display:·flex;␍
     79     │ - ··align-items:·center;␍
     80     │ - ··justify-content:·center;␍
     81     │ - ··gap:·0.5rem;␍
     82     │ - ··width:·100%;␍
     83     │ - ··padding:·12px;␍
     84     │ - ··background:·#667eea;␍
     85     │ - ··color:·white;␍
     86     │ - ··border:·none;␍
     87     │ - ··border-radius:·6px;␍
     88     │ - ··cursor:·pointer;␍
     89     │ - ··transition:·all·0.2s;␍
     90     │ - ··font-size:·0.9rem;␍
     91     │ - }␍
     92     │ - ␍
     93     │ - .upload-button:hover·{␍
     94     │ - ··background:·#5a6fd8;␍
     95     │ - ··transform:·translateY(-1px);␍
     96     │ - }␍
     97     │ - ␍
     98     │ - .url-input-section·{␍
     99     │ - ··display:·flex;␍
    100     │ - ··flex-direction:·column;␍
    101     │ - ··gap:·0.5rem;␍
    102     │ - }␍
    103     │ - ␍
    104     │ - .url-input·{␍
    105     │ - ··padding:·10px;␍
    106     │ - ··border:·2px·solid·#e0e0e0;␍
    107     │ - ··border-radius:·6px;␍
    108     │ - ··font-size:·0.9rem;␍
    109     │ - ··transition:·border-color·0.2s;␍
    110     │ - }␍
    111     │ - ␍
    112     │ - .url-input:focus·{␍
    113     │ - ··outline:·none;␍
    114     │ - ··border-color:·#667eea;␍
    115     │ - }␍
    116     │ - ␍
    117     │ - .url-upload-button·{␍
    118     │ - ··padding:·10px;␍
    119     │ - ··background:·#764ba2;␍
    120     │ - ··color:·white;␍
    121     │ - ··border:·none;␍
    122     │ - ··border-radius:·6px;␍
    123     │ - ··cursor:·pointer;␍
    124     │ - ··transition:·all·0.2s;␍
    125     │ - ··font-size:·0.9rem;␍
    126     │ - }␍
    127     │ - ␍
    128     │ - .url-upload-button:hover·{␍
    129     │ - ··background:·#6a4190;␍
    130     │ - }␍
    131     │ - ␍
    132     │ - .actions-section·h3·{␍
    133     │ - ··margin:·0·0·1rem·0;␍
    134     │ - ··color:·#333;␍
    135     │ - ··font-size:·1.1rem;␍
    136     │ - }␍
    137     │ - ␍
    138     │ - .action-button·{␍
    139     │ - ··display:·flex;␍
    140     │ - ··align-items:·center;␍
    141     │ - ··justify-content:·center;␍
    142     │ - ··gap:·0.5rem;␍
    143     │ - ··width:·100%;␍
    144     │ - ··padding:·12px;␍
    145     │ - ··background:·#28a745;␍
    146     │ - ··color:·white;␍
    147     │ - ··border:·none;␍
    148     │ - ··border-radius:·6px;␍
    149     │ - ··cursor:·pointer;␍
    150     │ - ··transition:·all·0.2s;␍
  341 more lines truncated
  

dws/src/App.tsx  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ The filename should be in kebab-case.
  
  ℹ The filename could be renamed to one of the following names:
    app.tsx
  

dws/src/App.tsx:207:3   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ This hook does not specify its dependency on loadPDFWithSession.
  
    206 │   // Load document from URL on component mount
  > 207 │   useEffect(() => {
        │   ^^^^^^^^^
    208 │     let cleanup = () => {}
    209 │ 
  
  ℹ This dependency is being used here, but is not specified in the hook dependency list.
  
    213 │         const documentUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    214 │         const token = await uploadFromUrl(documentUrl)
  > 215 │         cleanup = await loadPDFWithSession(token)
        │                         ^^^^^^^^^^^^^^^^^^
    216 │ 
    217 │       } catch (error) {
  
  ℹ Either include it or remove the dependency array.
  
  ℹ Unsafe fix: Add the missing dependency to the list.
  
    226 │ ··},·[loadPDFWithSession])␍
        │       ++++++++++++++++++  

dws/src/App.tsx:207:3   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ This hook does not specify its dependency on uploadFromUrl.
  
    206 │   // Load document from URL on component mount
  > 207 │   useEffect(() => {
        │   ^^^^^^^^^
    208 │     let cleanup = () => {}
    209 │ 
  
  ℹ This dependency is being used here, but is not specified in the hook dependency list.
  
    212 │         // Use a sample PDF URL for demonstration
    213 │         const documentUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
  > 214 │         const token = await uploadFromUrl(documentUrl)
        │                             ^^^^^^^^^^^^^
    215 │         cleanup = await loadPDFWithSession(token)
    216 │ 
  
  ℹ Either include it or remove the dependency array.
  
  ℹ Unsafe fix: Add the missing dependency to the list.
  
    226 │ ··},·[uploadFromUrl])␍
        │       +++++++++++++  

dws/src/App.tsx:257:11  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ Provide an explicit type prop for the button element.
  
    255 │             style={{ display: "none" }}
    256 │           />
  > 257 │           <button
        │           ^^^^^^^
  > 258 │             onClick={() => fileInputRef.current?.click()}
         ...
  > 267 │             }}
  > 268 │           >
        │           ^
    269 │             Upload File
    270 │           </button>
  
  ℹ The default type of a button is submit, which causes the submission of a form when placed inside a `form` element. This is likely not the behaviour that you want inside a React application.
  
  ℹ Allowed button types are: submit, button or reset
  

dws/src/App.tsx:271:11  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ Provide an explicit type prop for the button element.
  
    269 │             Upload File
    270 │           </button>
  > 271 │           <button
        │           ^^^^^^^
  > 272 │             onClick={convertToExcel}
         ...
  > 281 │             }}
  > 282 │           >
        │           ^
    283 │             Export to Excel
    284 │           </button>
  
  ℹ The default type of a button is submit, which causes the submission of a form when placed inside a `form` element. This is likely not the behaviour that you want inside a React application.
  
  ℹ Allowed button types are: submit, button or reset
  

dws/src/App.tsx:285:11  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ Provide an explicit type prop for the button element.
  
    283 │             Export to Excel
    284 │           </button>
  > 285 │           <button
        │           ^^^^^^^
  > 286 │             onClick={cleanupDocuments}
         ...
  > 295 │             }}
  > 296 │           >
        │           ^
    297 │             Cleanup Documents
    298 │           </button>
  
  ℹ The default type of a button is submit, which causes the submission of a form when placed inside a `form` element. This is likely not the behaviour that you want inside a React application.
  
  ℹ Allowed button types are: submit, button or reset
  

dws/src/App.tsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ File content differs from formatting output
  
      1     │ - import·{·useEffect,·useRef,·useState·}·from·'react'␍
      2     │ - import·'./app.css'␍
      3     │ - ␍
      4     │ - function·App()·{␍
      5     │ - ··const·containerRef·=·useRef<HTMLDivElement>(null)␍
      6     │ - ··const·[status,·setStatus]·=·useState("Initializing...")␍
      7     │ - ··const·[sessionToken,·setSessionToken]·=·useState<string·|·null>(null)␍
      8     │ - ··const·fileInputRef·=·useRef<HTMLInputElement>(null)␍
      9     │ - ␍
     10     │ - ··//·Function·to·upload·document·from·URL·and·get·session·token␍
     11     │ - ··const·uploadFromUrl·=·async·(url:·string)·=>·{␍
     12     │ - ····try·{␍
     13     │ - ······setStatus("Uploading·document·from·URL...")␍
     14     │ - ␍
     15     │ - ······const·response·=·await·fetch('http://localhost:3001/api/upload-from-url',·{␍
     16     │ - ········method:·'POST',␍
     17     │ - ········headers:·{␍
     18     │ - ··········'Content-Type':·'application/json',␍
     19     │ - ········},␍
     20     │ - ········body:·JSON.stringify({·url·}),␍
     21     │ - ······})␍
     22     │ - ␍
     23     │ - ······const·result·=·await·response.json()␍
     24     │ - ␍
     25     │ - ······if·(!result.success)·{␍
     26     │ - ········throw·new·Error(result.error·||·'Upload·failed')␍
     27     │ - ······}␍
     28     │ - ␍
     29     │ - ······setSessionToken(result.sessionToken)␍
     30     │ - ······return·result.sessionToken␍
     31     │ - ␍
     32     │ - ····}·catch·(error)·{␍
     33     │ - ······console.error('Upload·error:',·error)␍
     34     │ - ······throw·error␍
     35     │ - ····}␍
     36     │ - ··}␍
     37     │ - ␍
     38     │ - ··//·Function·to·upload·local·file·and·get·session·token␍
     39     │ - ··const·uploadFile·=·async·(file:·File)·=>·{␍
     40     │ - ····try·{␍
     41     │ - ······setStatus("Uploading·file...")␍
     42     │ - ␍
     43     │ - ······const·formData·=·new·FormData()␍
     44     │ - ······formData.append('file',·file)␍
     45     │ - ␍
     46     │ - ······const·response·=·await·fetch('http://localhost:3001/api/upload-and-create-session',·{␍
     47     │ - ········method:·'POST',␍
     48     │ - ········body:·formData,␍
     49     │ - ······})␍
     50     │ - ␍
     51     │ - ······const·result·=·await·response.json()␍
     52     │ - ␍
     53     │ - ······if·(!result.success)·{␍
     54     │ - ········throw·new·Error(result.error·||·'Upload·failed')␍
     55     │ - ······}␍
     56     │ - ␍
     57     │ - ······setSessionToken(result.sessionToken)␍
     58     │ - ······return·result.sessionToken␍
     59     │ - ␍
     60     │ - ····}·catch·(error)·{␍
     61     │ - ······console.error('Upload·error:',·error)␍
     62     │ - ······throw·error␍
     63     │ - ····}␍
     64     │ - ··}␍
     65     │ - ␍
     66     │ - ··//·Function·to·load·PDF·using·session·token␍
     67     │ - ··const·loadPDFWithSession·=·async·(token:·string)·=>·{␍
     68     │ - ····try·{␍
     69     │ - ······const·container·=·containerRef.current␍
     70     │ - ␍
     71     │ - ······//·Load·SDK·using·local·installation␍
     72     │ - ······const·NutrientViewer·=·(await·import("@nutrient-sdk/viewer")).default␍
     73     │ - ␍
     74     │ - ······//·Ensure·there's·only·one·NutrientViewer·instance␍
     75     │ - ······NutrientViewer.unload(container)␍
     76     │ - ␍
     77     │ - ······//·Verify·container·has·dimensions␍
     78     │ - ······if·(!container)·{␍
     79     │ - ········throw·new·Error("Container·ref·is·not·available")␍
     80     │ - ······}␍
     81     │ - ␍
     82     │ - ······const·rect·=·container.getBoundingClientRect()␍
     83     │ - ······if·(rect.width·===·0·||·rect.height·===·0)·{␍
     84     │ - ········throw·new·Error(`Container·has·no·dimensions:·${rect.width}x${rect.height}.·Check·your·CSS.`)␍
     85     │ - ······}␍
     86     │ - ␍
     87     │ - ······setStatus("Loading·PDF·with·session·token...")␍
     88     │ - ␍
     89     │ - ······//·Load·PDF·using·DWS·Viewer·API·session·token␍
     90     │ - ······if·(container·&&·NutrientViewer)·{␍
     91     │ - ········await·NutrientViewer.load({␍
     92     │ - ··········container,␍
     93     │ - ··········//·Use·session·token·instead·of·document·URL·for·DWS·API␍
     94     │ - ··········session:·token,␍
     95     │ - ··········//·baseUrl:·where·SDK·should·load·its·assets·from␍
     96     │ - ··········baseUrl:·`${window.location.protocol}//${window.location.host}/${␍
     97     │ - ············import.meta.env.PUBLIC_URL·??·""␍
     98     │ - ··········}`,␍
     99     │ - ········})␍
    100     │ - ······}␍
    101     │ - ␍
    102     │ - ······setStatus("PDF·loaded·successfully·via·DWS·Viewer·API!")␍
    103     │ - ␍
    104     │ - ······return·()·=>·{␍
    105     │ - ········NutrientViewer.unload(container)␍
    106     │ - ······}␍
    107     │ - ␍
    108     │ - ····}·catch·(error)·{␍
    109     │ - ······console.error("PDF·loading·failed:",·error)␍
    110     │ - ······setStatus(`Error:·${error·instanceof·Error·?·error.message·:·String(error)}`)␍
    111     │ - ······throw·error␍
    112     │ - ····}␍
    113     │ - ··}␍
    114     │ - ␍
    115     │ - ··//·Handle·file·selection␍
    116     │ - ··const·handleFileSelect·=·async·(event:·React.ChangeEvent<HTMLInputElement>)·=>·{␍
    117     │ - ····const·file·=·event.target.files?.[0]␍
    118     │ - ····if·(file)·{␍
    119     │ - ······try·{␍
    120     │ - ········const·token·=·await·uploadFile(file)␍
    121     │ - ········await·loadPDFWithSession(token)␍
    122     │ - ······}·catch·(error)·{␍
    123     │ - ········setStatus(`Error:·${error·instanceof·Error·?·error.message·:·String(error)}`)␍
    124     │ - ······}␍
    125     │ - ····}␍
    126     │ - ··}␍
    127     │ - ␍
    128     │ - ··//·Function·to·convert·PDF·to·Excel␍
    129     │ - ··const·convertToExcel·=·async·()·=>·{␍
    130     │ - ····try·{␍
    131     │ - ······setStatus("Converting·PDF·to·Excel...")␍
    132     │ - ␍
    133     │ - ······//·Use·a·sample·PDF·URL·for·demonstration␍
    134     │ - ······const·documentUrl·=·"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"␍
    135     │ - ␍
    136     │ - ······const·response·=·await·fetch('http://localhost:3001/api/convert-to-excel',·{␍
    137     │ - ········method:·'POST',␍
    138     │ - ········headers:·{␍
    139     │ - ··········'Content-Type':·'application/json',␍
    140     │ - ········},␍
    141     │ - ········body:·JSON.stringify({·url:·documentUrl·}),␍
    142     │ - ······})␍
    143     │ - ␍
    144     │ - ······if·(!response.ok)·{␍
    145     │ - ········const·errorData·=·await·response.json().catch(()·=>·({·error:·'Conversion·failed'·}))␍
    146     │ - ········throw·new·Error(errorData.error·||·'Failed·to·convert·PDF·to·Excel')␍
    147     │ - ······}␍
    148     │ - ␍
    149     │ - ······//·Get·the·Excel·file·as·blob␍
    150     │ - ······const·excelBlob·=·await·response.blob()␍
  529 more lines truncated
  

dws/src/components/pdf-viewer.jsx:9:3   FIXABLE  ━━━━━━━━━━

  ✖ This hook does not specify its dependency on viewerInstance.
  
     7 │   const [error, setError] = useState(null)
     8 │ 
   > 9 │   useEffect(() => {
       │   ^^^^^^^^^
    10 │     let instance = null
    11 │ 
  
  ℹ This dependency is being used here, but is not specified in the hook dependency list.
  
    18 │       try {
    19 │         // Clear any existing instance
  > 20 │         if (viewerInstance) {
       │             ^^^^^^^^^^^^^^
    21 │           await viewerInstance.unload()
    22 │           setViewerInstance(null)
  
  ℹ Unsafe fix: Add the missing dependency to the list.
  
    106 │ ··},·[sessionToken,·viewerInstance])␍
        │                   ++++++++++++++++  

dws/src/components/pdf-viewer.jsx:9:3   FIXABLE  ━━━━━━━━━━

  ✖ This hook does not specify its dependency on viewerInstance.unload.
  
     7 │   const [error, setError] = useState(null)
     8 │ 
   > 9 │   useEffect(() => {
       │   ^^^^^^^^^
    10 │     let instance = null
    11 │ 
  
  ℹ This dependency is being used here, but is not specified in the hook dependency list.
  
    19 │         // Clear any existing instance
    20 │         if (viewerInstance) {
  > 21 │           await viewerInstance.unload()
       │                 ^^^^^^^^^^^^^^^^^^^^^
    22 │           setViewerInstance(null)
    23 │         }
  
  ℹ Unsafe fix: Add the missing dependency to the list.
  
    106 │ ··},·[sessionToken,·viewerInstance.unload])␍
        │                   +++++++++++++++++++++++  

dws/src/components/pdf-viewer.jsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ File content differs from formatting output
  
      1     │ - import·{·useEffect,·useRef,·useState·}·from·'react'␍
      2     │ - ␍
      3     │ - const·PDFViewer·=·({·sessionToken·})·=>·{␍
      4     │ - ··const·containerRef·=·useRef(null)␍
      5     │ - ··const·[viewerInstance,·setViewerInstance]·=·useState(null)␍
      6     │ - ··const·[loading,·setLoading]·=·useState(true)␍
      7     │ - ··const·[error,·setError]·=·useState(null)␍
      8     │ - ␍
      9     │ - ··useEffect(()·=>·{␍
     10     │ - ····let·instance·=·null␍
     11     │ - ␍
     12     │ - ····const·loadViewer·=·async·()·=>·{␍
     13     │ - ······if·(!sessionToken·||·!containerRef.current)·return␍
     14     │ - ␍
     15     │ - ······setLoading(true)␍
     16     │ - ······setError(null)␍
     17     │ - ␍
     18     │ - ······try·{␍
     19     │ - ········//·Clear·any·existing·instance␍
     20     │ - ········if·(viewerInstance)·{␍
     21     │ - ··········await·viewerInstance.unload()␍
     22     │ - ··········setViewerInstance(null)␍
     23     │ - ········}␍
     24     │ - ␍
     25     │ - ········//·Clear·container␍
     26     │ - ········containerRef.current.innerHTML·=·''␍
     27     │ - ␍
     28     │ - ········//·Wait·for·NutrientViewer·to·be·available␍
     29     │ - ········if·(typeof·window.NutrientViewer·===·'undefined')·{␍
     30     │ - ··········throw·new·Error('NutrientViewer·is·not·loaded.·Please·check·the·CDN·script·in·index.html.')␍
     31     │ - ········}␍
     32     │ - ␍
     33     │ - ········//·Initialize·viewer·with·session·token␍
     34     │ - ········instance·=·await·window.NutrientViewer.load({␍
     35     │ - ··········container:·containerRef.current,␍
     36     │ - ··········sessionToken:·sessionToken,␍
     37     │ - ··········baseUrl:·'https://api.nutrient.io/',␍
     38     │ - ··········//·Configure·viewer·options␍
     39     │ - ··········theme:·window.matchMedia('(prefers-color-scheme:·dark)').matches·?·'dark'·:·'light',␍
     40     │ - ··········toolbarItems:·[␍
     41     │ - ············'sidebar-thumbnails',␍
     42     │ - ············'sidebar-document-outline',␍
     43     │ - ············'sidebar-annotations',␍
     44     │ - ············'pager',␍
     45     │ - ············'pan',␍
     46     │ - ············'zoom-out',␍
     47     │ - ············'zoom-in',␍
     48     │ - ············'zoom-mode',␍
     49     │ - ············'spacer',␍
     50     │ - ············'search',␍
     51     │ - ············'print',␍
     52     │ - ············'download'␍
     53     │ - ··········],␍
     54     │ - ··········annotationToolbarItems:·[␍
     55     │ - ············'ink',␍
     56     │ - ············'highlighter',␍
     57     │ - ············'text',␍
     58     │ - ············'note',␍
     59     │ - ············'rectangle',␍
     60     │ - ············'ellipse',␍
     61     │ - ············'line',␍
     62     │ - ············'arrow',␍
     63     │ - ············'polyline',␍
     64     │ - ············'polygon',␍
     65     │ - ············'cloudy-polygon',␍
     66     │ - ············'image',␍
     67     │ - ············'stamp',␍
     68     │ - ············'signature'␍
     69     │ - ··········],␍
     70     │ - ··········enableAnnotationToolbar:·true,␍
     71     │ - ··········enableFormDesignMode:·true,␍
     72     │ - ··········locale:·'en'␍
     73     │ - ········})␍
     74     │ - ␍
     75     │ - ········setViewerInstance(instance)␍
     76     │ - ········setLoading(false)␍
     77     │ - ␍
     78     │ - ········//·Handle·viewer·events␍
     79     │ - ········instance.addEventListener('viewState.currentPageIndex.change',·(pageIndex)·=>·{␍
     80     │ - ··········console.log('Page·changed:',·pageIndex)␍
     81     │ - ········})␍
     82     │ - ␍
     83     │ - ········instance.addEventListener('annotations.create',·(annotation)·=>·{␍
     84     │ - ··········console.log('Annotation·created:',·annotation)␍
     85     │ - ········})␍
     86     │ - ␍
     87     │ - ········instance.addEventListener('document.loaded',·()·=>·{␍
     88     │ - ··········console.log('Document·fully·loaded')␍
     89     │ - ········})␍
     90     │ - ␍
     91     │ - ······}·catch·(err)·{␍
     92     │ - ········console.error('Failed·to·load·PDF·viewer:',·err)␍
     93     │ - ········setError(err.message)␍
     94     │ - ········setLoading(false)␍
     95     │ - ······}␍
     96     │ - ····}␍
     97     │ - ␍
     98     │ - ····loadViewer()␍
     99     │ - ␍
    100     │ - ····//·Cleanup·function␍
    101     │ - ····return·()·=>·{␍
    102     │ - ······if·(instance)·{␍
    103     │ - ········instance.unload().catch(console.error)␍
    104     │ - ······}␍
    105     │ - ····}␍
    106     │ - ··},·[sessionToken])␍
    107     │ - ␍
    108     │ - ··if·(loading)·{␍
    109     │ - ····return·(␍
    110     │ - ······<div·style={{␍
    111     │ - ········display:·'flex',␍
    112     │ - ········alignItems:·'center',␍
    113     │ - ········justifyContent:·'center',␍
    114     │ - ········height:·'100%',␍
    115     │ - ········color:·'#667eea',␍
    116     │ - ········fontSize:·'1.1rem'␍
    117     │ - ······}}>␍
    118     │ - ········Loading·PDF·viewer...␍
    119     │ - ······</div>␍
    120     │ - ····)␍
    121     │ - ··}␍
    122     │ - ␍
    123     │ - ··if·(error)·{␍
    124     │ - ····return·(␍
    125     │ - ······<div·style={{␍
    126     │ - ········display:·'flex',␍
    127     │ - ········alignItems:·'center',␍
    128     │ - ········justifyContent:·'center',␍
    129     │ - ········height:·'100%',␍
    130     │ - ········color:·'#dc3545',␍
    131     │ - ········fontSize:·'1.1rem',␍
    132     │ - ········textAlign:·'center',␍
    133     │ - ········padding:·'2rem'␍
    134     │ - ······}}>␍
    135     │ - ········<div>␍
    136     │ - ··········<div·style={{·marginBottom:·'1rem'·}}>Failed·to·load·PDF·viewer</div>␍
    137     │ - ··········<div·style={{·fontSize:·'0.9rem',·opacity:·0.8·}}>␍
    138     │ - ············Error:·{error}␍
    139     │ - ··········</div>␍
    140     │ - ········</div>␍
    141     │ - ······</div>␍
    142     │ - ····)␍
    143     │ - ··}␍
    144     │ - ␍
    145     │ - ··return·(␍
    146     │ - ····<div␍
    147     │ - ······ref={containerRef}␍
    148     │ - ······style={{␍
    149     │ - ········width:·'100%',␍
    150     │ - ········height:·'100%',␍
  173 more lines truncated
  

dws/src/index.css format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ File content differs from formatting output
  
     1    │ - :root·{␍
     2    │ - ··font-family:·Inter,·system-ui,·Avenir,·Helvetica,·Arial,·sans-serif;␍
     3    │ - ··line-height:·1.5;␍
     4    │ - ··font-weight:·400;␍
     5    │ - ␍
     6    │ - ··color-scheme:·light·dark;␍
     7    │ - ··color:·rgba(255,·255,·255,·0.87);␍
     8    │ - ··background-color:·#242424;␍
     9    │ - ␍
    10    │ - ··font-synthesis:·none;␍
    11    │ - ··text-rendering:·optimizeLegibility;␍
    12    │ - ··-webkit-font-smoothing:·antialiased;␍
    13    │ - ··-moz-osx-font-smoothing:·grayscale;␍
    14    │ - }␍
    15    │ - ␍
    16    │ - a·{␍
    17    │ - ··font-weight:·500;␍
    18    │ - ··color:·#646cff;␍
    19    │ - ··text-decoration:·inherit;␍
    20    │ - }␍
    21    │ - a:hover·{␍
    22    │ - ··color:·#535bf2;␍
    23    │ - }␍
    24    │ - ␍
    25    │ - body·{␍
    26    │ - ··margin:·0;␍
    27    │ - ··display:·flex;␍
    28    │ - ··place-items:·center;␍
    29    │ - ··min-width:·320px;␍
    30    │ - ··min-height:·100vh;␍
    31    │ - }␍
    32    │ - ␍
    33    │ - h1·{␍
    34    │ - ··font-size:·3.2em;␍
    35    │ - ··line-height:·1.1;␍
    36    │ - }␍
    37    │ - ␍
    38    │ - button·{␍
    39    │ - ··border-radius:·8px;␍
    40    │ - ··border:·1px·solid·transparent;␍
    41    │ - ··padding:·0.6em·1.2em;␍
    42    │ - ··font-size:·1em;␍
    43    │ - ··font-weight:·500;␍
    44    │ - ··font-family:·inherit;␍
    45    │ - ··background-color:·#1a1a1a;␍
    46    │ - ··cursor:·pointer;␍
    47    │ - ··transition:·border-color·0.25s;␍
    48    │ - }␍
    49    │ - button:hover·{␍
    50    │ - ··border-color:·#646cff;␍
    51    │ - }␍
    52    │ - button:focus,␍
    53    │ - button:focus-visible·{␍
    54    │ - ··outline:·4px·auto·-webkit-focus-ring-color;␍
    55    │ - }␍
    56    │ - ␍
    57    │ - @media·(prefers-color-scheme:·light)·{␍
    58    │ - ··:root·{␍
    59    │ - ····color:·#213547;␍
    60    │ - ····background-color:·#ffffff;␍
    61    │ - ··}␍
    62    │ - ··a:hover·{␍
    63    │ - ····color:·#747bff;␍
    64    │ - ··}␍
    65    │ - ··button·{␍
    66    │ - ····background-color:·#f9f9f9;␍
    67    │ - ··}␍
    68    │ - }
        1 │ + :root·{
        2 │ + ··font-family:·Inter,·system-ui,·Avenir,·Helvetica,·Arial,·sans-serif;
        3 │ + ··line-height:·1.5;
        4 │ + ··font-weight:·400;
        5 │ + 
        6 │ + ··color-scheme:·light·dark;
        7 │ + ··color:·rgba(255,·255,·255,·0.87);
        8 │ + ··background-color:·#242424;
        9 │ + 
       10 │ + ··font-synthesis:·none;
       11 │ + ··text-rendering:·optimizeLegibility;
       12 │ + ··-webkit-font-smoothing:·antialiased;
       13 │ + ··-moz-osx-font-smoothing:·grayscale;
       14 │ + }
       15 │ + 
       16 │ + a·{
       17 │ + ··font-weight:·500;
       18 │ + ··color:·#646cff;
       19 │ + ··text-decoration:·inherit;
       20 │ + }
       21 │ + a:hover·{
       22 │ + ··color:·#535bf2;
       23 │ + }
       24 │ + 
       25 │ + body·{
       26 │ + ··margin:·0;
       27 │ + ··display:·flex;
       28 │ + ··place-items:·center;
       29 │ + ··min-width:·320px;
       30 │ + ··min-height:·100vh;
       31 │ + }
       32 │ + 
       33 │ + h1·{
       34 │ + ··font-size:·3.2em;
       35 │ + ··line-height:·1.1;
       36 │ + }
       37 │ + 
       38 │ + button·{
       39 │ + ··border-radius:·8px;
       40 │ + ··border:·1px·solid·transparent;
       41 │ + ··padding:·0.6em·1.2em;
       42 │ + ··font-size:·1em;
       43 │ + ··font-weight:·500;
       44 │ + ··font-family:·inherit;
       45 │ + ··background-color:·#1a1a1a;
       46 │ + ··cursor:·pointer;
       47 │ + ··transition:·border-color·0.25s;
       48 │ + }
       49 │ + button:hover·{
       50 │ + ··border-color:·#646cff;
       51 │ + }
       52 │ + button:focus,
       53 │ + button:focus-visible·{
       54 │ + ··outline:·4px·auto·-webkit-focus-ring-color;
       55 │ + }
       56 │ + 
       57 │ + @media·(prefers-color-scheme:·light)·{
       58 │ + ··:root·{
       59 │ + ····color:·#213547;
       60 │ + ····background-color:·#ffffff;
       61 │ + ··}
       62 │ + ··a:hover·{
       63 │ + ····color:·#747bff;
       64 │ + ··}
       65 │ + ··button·{
       66 │ + ····background-color:·#f9f9f9;
       67 │ + ··}
       68 │ + }
       69 │ + 
  

dws/src/main.jsx format ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ File content differs from formatting output
  
     1    │ - import·{·StrictMode·}·from·'react'␍
     2    │ - import·{·createRoot·}·from·'react-dom/client'␍
     3    │ - import·'./index.css'␍
     4    │ - import·App·from·'./app.tsx'␍
     5    │ - ␍
     6    │ - createRoot(document.getElementById('root')).render(␍
     7    │ - ··<StrictMode>␍
     8    │ - ····<App·/>␍
     9    │ - ··</StrictMode>,␍
    10    │ - )
        1 │ + import·{·StrictMode·}·from·"react";
        2 │ + import·{·createRoot·}·from·"react-dom/client";
        3 │ + import·"./index.css";
        4 │ + import·App·from·"./app.tsx";
        5 │ + 
        6 │ + createRoot(document.getElementById("root")).render(
        7 │ + ··<StrictMode>
        8 │ + ····<App·/>
        9 │ + ··</StrictMode>,
       10 │ + );
       11 │ + 
  

dws/vite.config.js:1:1   FIXABLE  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ The imports and exports are not sorted.
  
  > 1 │ import { defineConfig } from 'vite'
      │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    2 │ import react from '@vitejs/plugin-react'
    3 │ 
  
  ℹ Safe fix: Organize Imports (Biome)
  
     1    │ - import·{·defineConfig·}·from·'vite'␍
     2    │ - import·react·from·'@vitejs/plugin-react'␍
        1 │ + import·react·from·'@vitejs/plugin-react'
        2 │ + import·{·defineConfig·}·from·'vite'␍
     3  3 │   ␍
     4  4 │   export default defineConfig({␍
  

ci ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✖ Some errors were emitted while running checks.
  

Checked 33 files in 27ms. No fixes applied.
Found 20 errors.
Found 3 warnings.
Error: Process completed with exit code 1.
