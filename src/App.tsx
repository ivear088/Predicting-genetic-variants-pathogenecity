import React, { useState } from 'react';
import { HeartPulse, Cigarette, Beer, Factory, XCircle, Trash2, Download, Dna } from 'lucide-react';
import { useDNAModel } from './hooks/useDNAModel';

interface FamilyMember {
  name: string;
  dna: string;
  smoking: boolean;
  drinking: boolean;
  factoryWork: boolean;
  diseases: Set<string>;
}

interface FamilyData {
  mother: FamilyMember;
  father: FamilyMember;
  child: FamilyMember;
}

const INHERITED_DISEASES = [
  "Huntington's Disease",
  "Marfan Syndrome",
  "Neurofibromatosis Type 1 (NF1)",
  "Neurofibromatosis Type 2 (NF2)",
  "Polycystic Kidney Disease (PKD)",
  "Familial Hypercholesterolemia",
  "Achondroplasia (Dwarfism)",
  "Osteogenesis Imperfecta (Brittle Bone Disease)",
  "Li-Fraumeni Syndrome (Cancer Susceptibility)",
  "Tuberous Sclerosis",
  "Cystic Fibrosis",
  "Sickle Cell Anemia",
  "Tay-Sachs Disease",
  "Phenylketonuria (PKU)",
  "Albinism",
  "Gaucher's Disease",
  "Wilson's Disease",
  "Maple Syrup Urine Disease",
  "Xeroderma Pigmentosum",
  "Friedreich's Ataxia",
  "Hemophilia A & B",
  "Duchenne Muscular Dystrophy (DMD)",
  "Becker Muscular Dystrophy",
  "Color Blindness (Red-Green Type)",
  "Fragile X Syndrome",
  "G6PD Deficiency",
  "Lesch-Nyhan Syndrome",
  "X-Linked Agammaglobulinemia (XLA)",
  "Menkes Disease",
  "Ornithine Transcarbamylase (OTC) Deficiency",
  "Leber's Hereditary Optic Neuropathy (LHON)",
  "MELAS Syndrome",
  "MERRF Syndrome",
  "Kearns-Sayre Syndrome",
  "Leigh Syndrome",
  "Down Syndrome (Trisomy 21)",
  "Edward's Syndrome (Trisomy 18)",
  "Patau Syndrome (Trisomy 13)",
  "Turner Syndrome (45, X0)",
  "Klinefelter Syndrome (XXY)",
  "Galactosemia",
  "Homocystinuria",
  "Adrenoleukodystrophy (ALD)",
  "Canavan Disease",
  "Tyrosinemia",
  "Amyotrophic Lateral Sclerosis (ALS, Genetic Form)",
  "Spinocerebellar Ataxia (SCA)",
  "Rett Syndrome",
  "Spinal Muscular Atrophy (SMA)",
  "Charcot-Marie-Tooth Disease (CMT)",
  "Male Pattern Baldness (Androgenetic Alopecia)",
  "Widow's Peak (Hairline Trait)",
  "Cleft Chin",
  "Attached or Detached Earlobes",
  "Freckles",
  "Dimples",
  "Tongue Rolling Ability",
  "Hitchhiker's Thumb",
  "Curly or Straight Hair Type",
  "Eye Color (Genetic Trait)",
  "Asthma (Genetic Component Present in Some Cases)",
  "Eczema (Atopic Dermatitis - Often Hereditary)",
  "Psoriasis",
  "Type 1 Diabetes",
  "Type 2 Diabetes (Genetic Risk Factor)",
  "High Blood Pressure (Genetic Risk Factor)",
  "Schizophrenia (Genetic Predisposition)",
  "Bipolar Disorder (Genetic Predisposition)",
  "Autism Spectrum Disorder (Genetic Component Present)",
  "Depression (Heritable Risk Factor)"
];

function App() {
  const [familyData, setFamilyData] = useState<FamilyData>({
    mother: { name: '', dna: '', smoking: false, drinking: false, factoryWork: false, diseases: new Set() },
    father: { name: '', dna: '', smoking: false, drinking: false, factoryWork: false, diseases: new Set() },
    child: { name: '', dna: '', smoking: false, drinking: false, factoryWork: false, diseases: new Set() },
  });

  const [stagedDNA, setStagedDNA] = useState({
    mother: '',
    father: '',
    child: '',
  });

  const [tempInput, setTempInput] = useState({
    mother: '',
    father: '',
    child: '',
  });

  const [noFactors, setNoFactors] = useState({
    mother: false,
    father: false
  });

  const [showDiseases, setShowDiseases] = useState({
    mother: false,
    father: false
  });

  const { model, isLoading, error } = useDNAModel();

  const sigmoid = (z: number): number => {
    return 1 / (1 + Math.exp(-z));
  };

  const isAnalysisReady = () => {
    return (
      familyData.mother.dna && 
      familyData.father.dna && 
      familyData.child.dna &&
      familyData.mother.name.trim() &&
      familyData.father.name.trim() &&
      (noFactors.mother || familyData.mother.smoking || familyData.mother.drinking || familyData.mother.factoryWork) &&
      (noFactors.father || familyData.father.smoking || familyData.father.drinking || familyData.father.factoryWork)
    );
  };

  const calculateMutationScore = (seq1: string, seq2: string): number => {
    let mutations = 0;
    const minLength = Math.min(seq1.length, seq2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (seq1[i] !== seq2[i]) {
        mutations++;
      }
    }
    
    mutations += Math.abs(seq1.length - seq2.length);
    
    const totalLength = Math.max(seq1.length, seq2.length);
    return (mutations > 0 ? (totalLength / mutations) : 1) / 100;
  };

  const isPerfectMatch = (parent: string): boolean => {
    const parentDNA = familyData[parent as keyof FamilyData].dna;
    return parentDNA === familyData.child.dna;
  };

  const getHighestMatch = () => {
    if (!analysisResults) return null;
    
    const motherPerfect = isPerfectMatch('mother');
    const fatherPerfect = isPerfectMatch('father');
    
    if (analysisResults.motherSimilarity > analysisResults.fatherSimilarity) {
      return {
        parent: 'mother',
        similarity: analysisResults.motherSimilarity,
        name: familyData.mother.name || 'Mother',
        diseases: motherPerfect ? [] : Array.from(familyData.mother.diseases),
        isPerfectMatch: motherPerfect
      };
    } else {
      return {
        parent: 'father',
        similarity: analysisResults.fatherSimilarity,
        name: familyData.father.name || 'Father',
        diseases: fatherPerfect ? [] : Array.from(familyData.father.diseases),
        isPerfectMatch: fatherPerfect
      };
    }
  };

  const analyzeDNA = () => {
    const motherMatches = compareSequences(familyData.mother.dna, familyData.child.dna);
    const fatherMatches = compareSequences(familyData.father.dna, familyData.child.dna);
    
    const motherSimilarity = (motherMatches / Math.max(familyData.mother.dna.length, familyData.child.dna.length)) * 100;
    const fatherSimilarity = (fatherMatches / Math.max(familyData.father.dna.length, familyData.child.dna.length)) * 100;

    const motherMutationScore = calculateMutationScore(familyData.mother.dna, familyData.child.dna);
    const fatherMutationScore = calculateMutationScore(familyData.father.dna, familyData.child.dna);

    let traitProbability = 50;

    const motherPerfect = isPerfectMatch('mother');
    const fatherPerfect = isPerfectMatch('father');

    if (!motherPerfect && !fatherPerfect && model) {
      const features = [
        motherSimilarity,
        fatherSimilarity,
        motherMutationScore,
        fatherMutationScore,
        Number(familyData.mother.smoking || familyData.father.smoking),
        Number(familyData.mother.drinking || familyData.father.drinking),
        Number(familyData.mother.factoryWork || familyData.father.factoryWork)
      ];

      try {
        traitProbability = model.predict(features) * 100;
      } catch (error) {
        console.error('Prediction error:', error);
      }
    }

    return {
      motherSimilarity,
      fatherSimilarity,
      motherMutationScore,
      fatherMutationScore,
      traitProbability,
    };
  };

  const compareSequences = (parent: string, child: string): number => {
    let matches = 0;
    const maxLength = Math.max(parent.length, child.length);
    const minLength = Math.min(parent.length, child.length);
    
    for (let i = 0; i < minLength; i++) {
      if (parent[i] === child[i]) matches++;
    }
    
    return matches;
  };

  const validateDNASequence = (sequence: string): boolean => {
    return /^[ATCG]+$/i.test(sequence);
  };

  const validateName = (name: string): boolean => {
    return /^[a-zA-Z\s'-]{0,50}$/.test(name);
  };

  const handleDNAChange = (person: keyof FamilyData, value: string) => {
    const processedValue = value.replace(/[^ATCG]/gi, '').toUpperCase();
    
    setTempInput(prev => ({
      ...prev,
      [person]: processedValue
    }));

    if (validateDNASequence(processedValue)) {
      setFamilyData(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          dna: processedValue
        }
      }));
      setStagedDNA(prev => ({
        ...prev,
        [person]: processedValue
      }));
    }
  };

  const handleNameChange = (person: keyof FamilyData, value: string) => {
    if (validateName(value)) {
      setFamilyData(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          name: value
        }
      }));
    }
  };

  const handleDNAKeyDown = (person: keyof FamilyData, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const processedValue = tempInput[person].toUpperCase();
      
      if (validateDNASequence(processedValue)) {
        setFamilyData(prev => ({
          ...prev,
          [person]: {
            ...prev[person],
            dna: processedValue
          }
        }));
        setTempInput(prev => ({
          ...prev,
          [person]: processedValue
        }));
        setStagedDNA(prev => ({
          ...prev,
          [person]: processedValue
        }));
      }
    }
  };

  const handleDNAPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const processedValue = pastedText.replace(/[^ATCG]/gi, '').toUpperCase();
    const target = e.target as HTMLTextAreaElement;
    const person = target.getAttribute('data-person') as keyof FamilyData;
    
    handleDNAChange(person, processedValue);
  };

  const handleDNABlur = (person: keyof FamilyData) => {
    const processedValue = tempInput[person].toUpperCase();
    
    if (validateDNASequence(processedValue)) {
      setFamilyData(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          dna: processedValue
        }
      }));
      setTempInput(prev => ({
        ...prev,
        [person]: processedValue
      }));
      setStagedDNA(prev => ({
        ...prev,
        [person]: processedValue
      }));
    }
  };

  const handleInputChange = (
    person: keyof FamilyData,
    field: keyof FamilyMember,
    value: boolean
  ) => {
    if (value) {
      setNoFactors(prev => ({
        ...prev,
        [person]: false
      }));
    }
    setFamilyData((prev) => ({
      ...prev,
      [person]: {
        ...prev[person],
        [field]: value,
      },
    }));
  };

  const handleDiseaseToggle = (person: keyof FamilyData, disease: string) => {
    setFamilyData(prev => {
      const newDiseases = new Set(prev[person].diseases);
      if (newDiseases.has(disease)) {
        newDiseases.delete(disease);
      } else {
        newDiseases.add(disease);
      }
      return {
        ...prev,
        [person]: {
          ...prev[person],
          diseases: newDiseases
        }
      };
    });
  };

  const handleNoFactors = (person: 'mother' | 'father', value: boolean) => {
    setNoFactors(prev => ({
      ...prev,
      [person]: value
    }));
    if (value) {
      setFamilyData(prev => ({
        ...prev,
        [person]: {
          ...prev[person],
          smoking: false,
          drinking: false,
          factoryWork: false
        }
      }));
    }
  };

  const clearEnvironmentalFactors = (person: 'mother' | 'father') => {
    setNoFactors(prev => ({
      ...prev,
      [person]: false
    }));
    setFamilyData(prev => ({
      ...prev,
      [person]: {
        ...prev[person],
        smoking: false,
        drinking: false,
        factoryWork: false
      }
    }));
  };

  const toggleDiseasesList = (person: 'mother' | 'father') => {
    setShowDiseases(prev => ({
      ...prev,
      [person]: !prev[person]
    }));
  };

  const downloadReport = () => {
    if (!analysisResults) return;

    const highestMatch = getHighestMatch();
    const motherPerfect = isPerfectMatch('mother');
    const fatherPerfect = isPerfectMatch('father');

    const report = `DNA Analysis Report
Date: ${new Date().toLocaleDateString()}

Parents Information:
------------------
Mother's Name: ${familyData.mother.name}
Father's Name: ${familyData.father.name}

DNA Analysis Results:
-------------------
1. DNA Similarity Analysis:
   - Match with Mother: ${analysisResults.motherSimilarity.toFixed(1)}%
   - Match with Father: ${analysisResults.fatherSimilarity.toFixed(1)}%

   Highest DNA Match: ${highestMatch?.name} (${highestMatch?.similarity.toFixed(1)}%)
   ${highestMatch?.isPerfectMatch ? 'Perfect DNA match detected - inherited diseases analysis skipped' : 
   `${highestMatch?.name}'s Inherited Diseases:
   ${highestMatch?.diseases.length ? highestMatch.diseases.map(disease => `   - ${disease}`).join('\n') : '   No diseases reported'}`}

2. Mutation Analysis:
   - Mother's Mutation Score: ${analysisResults.motherMutationScore.toFixed(4)}
     (Calculated as: Total Length / Number of Mutations / 100)
   - Father's Mutation Score: ${analysisResults.fatherMutationScore.toFixed(4)}
     (Calculated as: Total Length / Number of Mutations / 100)

3. Trait Probability:
   - Probability of Inherited Traits: ${analysisResults.traitProbability.toFixed(1)}%
   ${(motherPerfect || fatherPerfect) ? '   (Set to 50% due to perfect DNA match)' : ''}

4. Environmental Factors:
   Mother:
   ${noFactors.mother ? '   - No environmental factors reported' : `
   - Smoking: ${familyData.mother.smoking ? 'Yes' : 'No'}
   - Drinking: ${familyData.mother.drinking ? 'Yes' : 'No'}
   - Factory Work Exposure: ${familyData.mother.factoryWork ? 'Yes' : 'No'}`}

   Father:
   ${noFactors.father ? '   - No environmental factors reported' : `
   - Smoking: ${familyData.father.smoking ? 'Yes' : 'No'}
   - Drinking: ${familyData.father.drinking ? 'Yes' : 'No'}
   - Factory Work Exposure: ${familyData.father.factoryWork ? 'Yes' : 'No'}`}

5. Inherited Diseases:
   ${(motherPerfect || fatherPerfect) ? 'Inherited diseases analysis skipped due to perfect DNA match' : `
   Mother's Reported Diseases:
   ${Array.from(familyData.mother.diseases).map(disease => `   - ${disease}`).join('\n') || '   No diseases reported'}

   Father's Reported Diseases:
   ${Array.from(familyData.father.diseases).map(disease => `   - ${disease}`).join('\n') || '   No diseases reported'}`}

6. DNA Sequences:
   Mother's DNA Length: ${familyData.mother.dna.length} bases
   Father's DNA Length: ${familyData.father.dna.length} bases
   Child's DNA Length: ${familyData.child.dna.length} bases

Note: Mutation scores are calculated by dividing the total sequence length by the number of mutations,
then dividing by 100 for normalization. A higher score indicates fewer mutations relative to sequence length.
${(motherPerfect || fatherPerfect) ? '\nSpecial Note: Perfect DNA match detected - inherited diseases analysis has been skipped and trait probability set to 50%.' : ''}`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dna-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const analysisResults = isAnalysisReady() ? analyzeDNA() : null;
  const highestMatch = analysisResults ? getHighestMatch() : null;

  const PersonForm = ({ person, title }: { person: keyof FamilyData; title: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <HeartPulse className="text-red-500" />
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {person !== 'child' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={familyData[person].name}
              onChange={(e) => handleNameChange(person, e.target.value)}
              placeholder={`Enter ${person}'s full name`}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              Only letters, spaces, hyphens and apostrophes allowed (max 50 characters)
            </p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DNA Sequence
          </label>
          <div className="relative">
            <textarea
              value={tempInput[person]}
              onChange={(e) => handleDNAChange(person, e.target.value)}
              onKeyDown={(e) => handleDNAKeyDown(person, e)}
              onPaste={handleDNAPaste}
              onBlur={() => handleDNABlur(person)}
              data-person={person}
              placeholder="Enter complete DNA sequence (only ATCG allowed)"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[200px] font-mono text-sm leading-relaxed ${
                tempInput[person] && !validateDNASequence(tempInput[person])
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              style={{ resize: 'vertical' }}
            />
          </div>
          {tempInput[person] && !validateDNASequence(tempInput[person]) && (
            <p className="text-sm text-red-500 font-medium mt-2">
              Invalid sequence: Only A, T, C, and G characters are allowed
            </p>
          )}
          <div className="flex justify-between mt-2">
            <p className="text-sm text-gray-500">
              {!tempInput[person] && "Only A, T, C, and G characters are allowed"}
            </p>
            <p className="text-sm text-gray-500">
              Length: {tempInput[person].length} bases
            </p>
          </div>
          {familyData[person].dna && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-blue-600">
                  Confirmed sequence
                </p>
                <span className="text-sm text-gray-500">
                  {familyData[person].dna.length} bases
                </span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                <div className="font-mono text-sm break-all bg-white p-3 rounded border border-gray-100 shadow-inner">
                  {familyData[person].dna}
                </div>
              </div>
            </div>
          )}
        </div>
        {person !== 'child' && (
          <>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={noFactors[person as 'mother' | 'father']}
                    onChange={(e) => handleNoFactors(person as 'mother' | 'father', e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <XCircle className="w-4 h-4" /> None of the below factors
                </label>
                <button
                  onClick={() => clearEnvironmentalFactors(person as 'mother' | 'father')}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Clear Factors
                </button>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={familyData[person].smoking}
                    onChange={(e) => handleInputChange(person, 'smoking', e.target.checked)}
                    disabled={noFactors[person as 'mother' | 'father']}
                    className="rounded text-blue-600"
                  />
                  <Cigarette className="w-4 h-4" /> Smoking
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={familyData[person].drinking}
                    onChange={(e) => handleInputChange(person, 'drinking', e.target.checked)}
                    disabled={noFactors[person as 'mother' | 'father']}
                    className="rounded text-blue-600"
                  />
                  <Beer className="w-4 h-4" /> Drinking
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={familyData[person].factoryWork}
                    onChange={(e) => handleInputChange(person, 'factoryWork', e.target.checked)}
                    disabled={noFactors[person as 'mother' | 'father']}
                    className="rounded text-blue-600"
                  />
                  <Factory className="w-4 h-4" /> Factory Work
                </label>
                <button
                  onClick={() => toggleDiseasesList(person as 'mother' | 'father')}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors border border-purple-200 rounded-md hover:bg-purple-50"
                >
                  <Dna className="w-4 h-4" />
                  {showDiseases[person as 'mother' | 'father'] ? 'Hide' : 'Show'} Inherited Diseases
                </button>
              </div>
            </div>
            {showDiseases[person as 'mother' | 'father'] && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Select Inherited Diseases</h3>
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                  {INHERITED_DISEASES.map((disease) => (
                    <label key={disease} className="flex items-start gap-2 p-2 hover:bg-gray-100 rounded-md">
                      <input
                        type="checkbox"
                        checked={familyData[person].diseases.has(disease)}
                        onChange={() => handleDiseaseToggle(person, disease)}
                        className="mt-1 rounded text-purple-600"
                      />
                      <span className="text-sm">{disease}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Family DNA Analysis
        </h1>

        {isLoading && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Initializing DNA analysis model...
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error initializing model: {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <PersonForm person="mother" title="Mother's Information" />
        <PersonForm person="father" title="Father's Information" />
        <PersonForm person="child" title="Child's Information" />

        {!isAnalysisReady() && familyData.child.dna && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please provide DNA sequences for all family members, names for both parents, and select either environmental factors or "None" for each parent to view the analysis.
                </p>
              </div>
            </div>
          </div>
        )}

        {analysisResults && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Analysis Results</h2>
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Report
              </button>
            </div>
            <div className="space-y-4">
              {highestMatch && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                  <h3 className="font-semibold text-green-800 mb-2">Highest DNA Match</h3>
                  <p className="text-green-700">
                    {highestMatch.name} has the highest DNA match with the child at{' '}
                    <span className="font-bold">{highestMatch.similarity.toFixed(1)}%</span>
                    {highestMatch.isPerfectMatch && ' (Perfect Match)'}
                  </p>
                  {!highestMatch.isPerfectMatch && (
                    <div className="mt-2">
                      <h4 className="font-medium text-green-800">Inherited Diseases from {highestMatch.name}:</h4>
                      {highestMatch.diseases.length > 0 ? (
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          {highestMatch.diseases.map(disease => (
                            <li key={disease} className="text-green-700">{disease}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-green-700 mt-1">No diseases reported</p>
                      )}
                    </div>
                  )}
                  {highestMatch.isPerfectMatch && (
                    <p className="text-green-700 mt-2 font-medium">
                      Perfect DNA match detected - inherited diseases analysis skipped
                    </p>
                  )}
                </div>
              )}

              <div>
                <p className="text-lg">
                  DNA Match with {familyData.mother.name || 'Mother'}:{' '}
                  <span className="font-semibold">{analysisResults.motherSimilarity.toFixed(1)}%</span>
                  {isPerfectMatch('mother') && ' (Perfect Match)'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${analysisResults.motherSimilarity}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Mutation Score: <span className="font-medium">{analysisResults.motherMutationScore.toFixed(4)}</span>
                  <span className="text-xs ml-2">(Total Length / Number of Mutations / 100)</span>
                </p>
              </div>
              <div>
                <p className="text-lg">
                  DNA Match with {familyData.father.name || 'Father'}:{' '}
                  <span className="font-semibold">{analysisResults.fatherSimilarity.toFixed(1)}%</span>
                  {isPerfectMatch('father') && ' (Perfect Match)'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${analysisResults.fatherSimilarity}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Mutation Score: <span className="font-medium">{analysisResults.fatherMutationScore.toFixed(4)}</span>
                  <span className="text-xs ml-2">(Total Length / Number of Mutations / 100)</span>
                </p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold mb-2">Trait Analysis (Logistic Regression):</h3>
                <p className="text-lg mb-2">
                  Probability of Inherited Traits: {' '}
                  <span className="font-semibold">{analysisResults.traitProbability.toFixed(1)}%</span>
                  {(isPerfectMatch('mother') || isPerfectMatch('father')) && 
                    <span className="text-sm text-blue-600 ml-2">(Set to 50% due to perfect DNA match)</span>
                  }
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${analysisResults.traitProbability}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold mb-2">Environmental Risk Factors:</h3>
                {(noFactors.mother && noFactors.father) ? (
                  <p className="text-gray-600">No environmental risk factors reported for either parent.</p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {familyData.mother.smoking && (
                      <li className="text-red-600">{familyData.mother.name || "Mother"}'s smoking may affect genetic expression</li>
                    )}
                    {familyData.father.smoking && (
                      <li className="text-red-600">{familyData.father.name || "Father"}'s smoking may affect genetic expression</li>
                    )}
                    {familyData.mother.drinking && (
                      <li className="text-orange-600">{familyData.mother.name || "Mother"}'s drinking habits may influence traits</li>
                    )}
                    {familyData.father.drinking && (
                      <li className="text-orange-600">{familyData.father.name || "Father"}'s drinking habits may influence traits</li>
                    )}
                    {(familyData.mother.factoryWork || familyData.father.factoryWork) && (
                      <li className="text-yellow-600">Industrial exposure may affect genetic markers</li>
                    )}
                  </ul>
                )}
              </div>

              {!isPerfectMatch('mother') && !isPerfectMatch('father') && (familyData.mother.diseases.size > 0 || familyData.father.diseases.size > 0) && (
                <div className="mt-4 p-4 bg-purple-50 rounded-md">
                  <h3 className="font-semibold mb-2">Inherited Diseases:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">{familyData.mother.name || "Mother"}'s Reported Diseases:</h4>
                      {familyData.mother.diseases.size > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {Array.from(familyData.mother.diseases).map(disease => (
                            <li key={disease} className="text-purple-700">{disease}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No diseases reported</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{familyData.father.name || "Father"}'s Reported Diseases:</h4>
                      {familyData.father.diseases.size > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {Array.from(familyData.father.diseases).map(disease => (
                            <li key={disease} className="text-purple-700">{disease}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600">No diseases reported</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;