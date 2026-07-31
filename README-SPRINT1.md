# Anna AI V6 — Sprint 1 Start

Copy these files into `C:\Users\HMT\anna-ai` while using the `ai-speaking-v6` branch.

## Install

```powershell
cd C:\Users\HMT\anna-ai
python -m venv .sprint1-venv
.\.sprint1-venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-sprint1.txt
```

## 1. Migrate the current HSK 1 dataset

```powershell
python .\sprint1_dataset_audio.py migrate
```

Creates:

```text
data\speaking-practice\hsk1.json
```

## 2. Review English translations

The migrated file requires a non-empty `english` value for every sentence. Add missing English translations before paid audio generation.

## 3. Validate the dataset

```powershell
python .\sprint1_dataset_audio.py validate
```

Do not generate thousands of audio files until validation passes.

## 4. Build the frontend search index

```powershell
python .\sprint1_dataset_audio.py build-search
```

Creates:

```text
public\data\speaking-practice\search-index.json
```

## 5. Generate sentence 1 only

Your `.env.local` must contain `OPENAI_API_KEY`. Never expose that key in frontend source code or commit it.

```powershell
python .\sprint1_dataset_audio.py generate-audio `
  --start 1 `
  --end 1 `
  --mode both `
  --overwrite
```

Creates:

```text
public\audio\speaking-practice\hsk1\000001.mp3
public\audio\speaking-practice\hsk1\000001_slow.mp3
```

## 6. Browser test

```text
http://localhost:3000/audio/speaking-practice/hsk1/000001.mp3
```

Approve the voice before generating 10, 100, or 5,000 sentences.
