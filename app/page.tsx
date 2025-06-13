import Image from "next/image";
import { promises as fs } from 'fs';
import yaml from 'js-yaml';
import path from 'path';

interface BiblicalPerson {
  id: string;
  name: string;
  names?: { name: string; reference: string }[];
  gender?: string;
  age?: string;
  parents?: string[];
  spouses?: string[];
  references?: string[];
  created?: boolean;
  translated?: boolean;
  foster_father?: string;
}

interface TimelinePeriod {
  name: string;
  description: string;
  yearRange: string;
  color: string;
  keyFigures: string[];
  events: string[];
}

interface AncestryData {
  biblical_persons: BiblicalPerson[];
}

function PersonCard({ person, children }: { person: BiblicalPerson; children?: React.ReactNode }) {
  const getColorScheme = (person: BiblicalPerson) => {
    // Divine figures
    if (['GOD_FATHER', 'JESUS'].includes(person.id)) {
      return { bg: 'bg-yellow-200', border: 'border-yellow-400', text: 'text-yellow-800' };
    }
    // Patriarchs
    if (['ABRAHAM', 'ISAAC', 'JACOB'].includes(person.id)) {
      return { bg: 'bg-purple-200', border: 'border-purple-400', text: 'text-purple-800' };
    }
    // Kings
    if (['DAVID', 'SOLOMON'].includes(person.id) || person.name.includes('King')) {
      return { bg: 'bg-red-200', border: 'border-red-400', text: 'text-red-800' };
    }
    // Prophets
    if (['MOSES', 'ELIJAH', 'ELISHA', 'ISAIAH', 'JEREMIAH', 'DANIEL'].includes(person.id)) {
      return { bg: 'bg-green-200', border: 'border-green-400', text: 'text-green-800' };
    }
    // Apostles
    if (person.id.includes('APOSTLE') || ['PETER', 'PAUL', 'JOHN_THE_APOSTLE'].includes(person.id)) {
      return { bg: 'bg-indigo-200', border: 'border-indigo-400', text: 'text-indigo-800' };
    }
    // Women
    if (person.gender === 'female') {
      return { bg: 'bg-pink-200', border: 'border-pink-400', text: 'text-pink-800' };
    }
    // Default
    return { bg: 'bg-blue-200', border: 'border-blue-400', text: 'text-blue-800' };
  };
  
  const colors = getColorScheme(person);
  const initials = person.name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
  return (
    <div className="text-center mx-1">
      <div className="flex flex-col justify-center items-center">
        <div className={`w-14 h-14 ${colors.bg} rounded-full flex items-center justify-center border-2 ${colors.border} shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer`}>
          <span className={`text-xs font-bold ${colors.text}`}>
            {initials}
          </span>
        </div>
        <div className="text-gray-700 mt-1 max-w-16">
          <p className="font-medium text-xs leading-tight">{person.name}</p>
          {person.age && <p className="text-xs text-gray-500">{person.age}</p>}
          {person.created && <p className="text-xs text-orange-600">⭐</p>}
          {person.translated && <p className="text-xs text-cyan-600">↗️</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

interface TreeNode {
  person: BiblicalPerson;
  children: TreeNode[];
  level: number;
}

function Timeline({ persons, regions }: { persons: BiblicalPerson[]; regions: any[] }) {
  const getPersonById = (id: string) => persons.find(p => p.id === id);
  const getRegionById = (id: string) => regions.find((r: any) => r.id === id);
  
  const timelinePeriods: TimelinePeriod[] = [
    {
      name: "Creation & Pre-Flood",
      description: "From the creation of Adam to the Great Flood",
      yearRange: "~4000-2400 BC",
      color: "bg-green-100 border-green-400",
      keyFigures: ["ADAM", "EVE", "SETH", "ENOCH", "METHUSELAH", "NOAH"],
      events: ["Creation of Man", "Fall of Man", "First Murder (Cain & Abel)", "Enoch Translated", "The Great Flood"]
    },
    {
      name: "Post-Flood Patriarchs",
      description: "From Noah to the calling of Abraham",
      yearRange: "~2400-2000 BC",
      color: "bg-blue-100 border-blue-400",
      keyFigures: ["NOAH", "SHEM", "ABRAHAM", "ISAAC", "JACOB"],
      events: ["Tower of Babel", "Call of Abraham", "Covenant with Abraham", "Isaac's Birth", "Jacob's Ladder"]
    },
    {
      name: "Egyptian Sojourn",
      description: "From Jacob's family to the Exodus",
      yearRange: "~1700-1400 BC",
      color: "bg-yellow-100 border-yellow-400",
      keyFigures: ["JOSEPH", "MOSES", "AARON", "JOSHUA"],
      events: ["Joseph in Egypt", "Israelites Enslaved", "Moses Born", "The Exodus", "Mount Sinai"]
    },
    {
      name: "Judges & United Kingdom",
      description: "From the conquest to the divided kingdom",
      yearRange: "~1400-930 BC",
      color: "bg-purple-100 border-purple-400",
      keyFigures: ["JOSHUA", "SAMUEL", "SAUL", "DAVID", "SOLOMON"],
      events: ["Conquest of Canaan", "Period of Judges", "First King (Saul)", "David's Kingdom", "Temple Built"]
    },
    {
      name: "Divided Kingdom & Exile",
      description: "From the kingdom split to the Babylonian exile",
      yearRange: "~930-540 BC",
      color: "bg-red-100 border-red-400",
      keyFigures: ["REHOBOAM", "ELIJAH", "ELISHA", "ISAIAH", "JEREMIAH"],
      events: ["Kingdom Divided", "Prophetic Ministry", "Northern Kingdom Falls", "Judah Exiled", "Temple Destroyed"]
    },
    {
      name: "Return & Second Temple",
      description: "From the return from exile to the New Testament",
      yearRange: "~540 BC-30 AD",
      color: "bg-indigo-100 border-indigo-400",
      keyFigures: ["ZERUBBABEL", "EZRA", "NEHEMIAH", "JOHN_THE_BAPTIST", "JESUS"],
      events: ["Return from Exile", "Temple Rebuilt", "Walls Rebuilt", "Silent Years", "Christ's Birth"]
    },
    {
      name: "New Testament Era",
      description: "The life of Christ and early church",
      yearRange: "~30-100 AD",
      color: "bg-pink-100 border-pink-400",
      keyFigures: ["JESUS", "PETER", "PAUL", "JOHN_THE_APOSTLE"],
      events: ["Christ's Ministry", "Crucifixion", "Resurrection", "Pentecost", "Church Established"]
    }
  ];
  
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Biblical Timeline</h2>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-300"></div>
        
        {/* Timeline periods */}
        <div className="space-y-8">
          {timelinePeriods.map((period, index) => (
            <div key={index} className="relative flex items-start">
              {/* Timeline dot */}
              <div className="absolute left-6 w-5 h-5 bg-white border-4 border-gray-400 rounded-full z-10"></div>
              
              {/* Content */}
              <div className="ml-16 flex-1">
                <div className={`p-6 rounded-lg border-2 ${period.color} shadow-md`}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 mb-4 lg:mb-0 lg:mr-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{period.name}</h3>
                      <p className="text-gray-600 mb-2">{period.description}</p>
                      <p className="text-sm font-semibold text-gray-700 mb-3">{period.yearRange}</p>
                      
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-700 mb-2">Key Events:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {period.events.map((event, eventIndex) => (
                            <li key={eventIndex}>{event}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="lg:w-80">
                      <h4 className="font-semibold text-gray-700 mb-3">Key Figures:</h4>
                      <div className="flex flex-wrap gap-2">
                        {period.keyFigures.map((figureId: string) => {
                          const person = getPersonById(figureId);
                          return person ? (
                            <div key={figureId} className="transform scale-75">
                              <PersonCard person={person} />
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FamilyTree({ persons, regions }: { persons: BiblicalPerson[]; regions: any[] }) {
  const getPersonById = (id: string) => persons.find(p => p.id === id);
  const getChildren = (parentId: string) => persons.filter(p => p.parents?.includes(parentId));
  
  // Build a proper tree structure
  const buildTree = (rootId: string, maxDepth: number = 4): TreeNode | null => {
    const person = getPersonById(rootId);
    if (!person) return null;
    
    const buildNode = (person: BiblicalPerson, level: number): TreeNode => {
      const children = level < maxDepth ? getChildren(person.id) : [];
      return {
        person,
        children: children.map(child => buildNode(child, level + 1)),
        level
      };
    };
    
    return buildNode(person, 0);
  };
  
  // Create focused family trees
  const adamTree = buildTree('ADAM', 3);
  const abrahamTree = buildTree('ABRAHAM', 3);
  const davidTree = buildTree('DAVID', 3);
  const jacobTree = buildTree('JACOB', 2); // Jacob's 12 sons
  
  const renderTree = (node: TreeNode | null, title: string): React.ReactNode => {
    if (!node) return null;
    
    const TreeNodeComponent = ({ treeNode, isRoot = false }: { treeNode: TreeNode; isRoot?: boolean }) => {
      const hasChildren = treeNode.children.length > 0;
      
      return (
        <div className="flex flex-col items-center relative">
          {/* Person Card */}
          <div className={`z-10 ${isRoot ? 'mb-8' : 'mb-4'}`}>
            <PersonCard person={treeNode.person} />
          </div>
          
          {/* Children Section */}
          {hasChildren && (
            <div className="relative">
              {/* Vertical line down from parent */}
              <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-gray-400 transform -translate-x-px"></div>
              
              {/* Horizontal connecting line */}
              {treeNode.children.length > 1 && (
                <div 
                  className="absolute top-4 bg-gray-400 h-0.5" 
                  style={{
                    left: `${100 / treeNode.children.length / 2}%`,
                    right: `${100 / treeNode.children.length / 2}%`
                  }}
                ></div>
              )}
              
              {/* Children Grid */}
              <div className="flex justify-center items-start pt-4 gap-8 flex-wrap">
                {treeNode.children.map((child, index) => (
                  <div key={child.person.id} className="relative">
                    {/* Vertical line up to child */}
                    <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-gray-400 transform -translate-x-px"></div>
                    <div className="pt-4">
                      <TreeNodeComponent treeNode={child} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-center mb-8 text-blue-800">{title}</h3>
        <div className="flex justify-center overflow-x-auto pb-8">
          <div className="min-w-fit">
            <TreeNodeComponent treeNode={node} isRoot={true} />
          </div>
        </div>
      </div>
    );
  };
  
  const renderTwelveSons = (): React.ReactNode => {
    const jacob = getPersonById('JACOB');
    if (!jacob) return null;
    
    const sons = ['REUBEN', 'SIMEON', 'LEVI', 'JUDAH', 'DAN', 'NAPHTALI', 'GAD', 'ASHER', 'ISSACHAR', 'ZEBULUN', 'JOSEPH', 'BENJAMIN']
      .map(id => getPersonById(id))
      .filter(Boolean) as BiblicalPerson[];
    
    return (
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-center mb-8 text-purple-800">The Twelve Sons of Jacob (Israel)</h3>
        <div className="flex flex-col items-center">
          <PersonCard person={jacob} />
          <div className="w-0.5 h-8 bg-gray-400 my-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 justify-items-center">
            {sons.map((son, index) => (
              <div key={son.id} className="relative">
                {/* Connecting line to parent */}
                <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-gray-400 transform -translate-x-px"></div>
                <PersonCard person={son} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4">
      <div className="space-y-16">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">Biblical History: Timeline & Genealogies</h1>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Explore the chronological progression of biblical history and the family relationships 
          that shaped God's plan through the ages, from Creation to the New Testament era.
        </p>
        
        <Timeline persons={persons} regions={regions} />
        
        {/* Quick Navigation */}
        <div className="bg-gray-50 rounded-lg p-6 text-center my-12">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Timeline at a Glance</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-green-200 text-green-800 rounded-full text-sm font-medium">Creation (~4000 BC)</span>
            <span className="px-4 py-2 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">Abraham (~2000 BC)</span>
            <span className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">Exodus (~1400 BC)</span>
            <span className="px-4 py-2 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">David (~1000 BC)</span>
            <span className="px-4 py-2 bg-red-200 text-red-800 rounded-full text-sm font-medium">Exile (~600 BC)</span>
            <span className="px-4 py-2 bg-pink-200 text-pink-800 rounded-full text-sm font-medium">Christ (~30 AD)</span>
          </div>
          <p className="text-sm text-gray-600 mt-4">Biblical chronology spans approximately 4,000+ years</p>
        </div>
        
        <div className="border-t-2 border-gray-200 pt-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Family Trees by Era</h2>
          
          {renderTree(adamTree, "🌱 The First Family: Adam and His Descendants (Pre-Flood Era)")}
          {renderTree(abrahamTree, "⭐ The Patriarchs: Abraham's Family Tree (Patriarchal Era)")}
          {renderTwelveSons()}
          {renderTree(davidTree, "👑 The Royal Line: David's Dynasty (Kingdom Era)")}
        </div>
      </div>
      
      {/* Additional notable figures */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8 text-purple-800">Notable Biblical Figures</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center">
          {['MOSES', 'AARON', 'JOSHUA', 'SAMUEL', 'ELIJAH', 'ELISHA', 'ISAIAH', 'JEREMIAH', 'DANIEL', 'EZRA', 'NEHEMIAH', 'JOHN_THE_BAPTIST'].map((id: string) => {
            const person = getPersonById(id);
            return person ? <PersonCard key={id} person={person} /> : null;
          })}
        </div>
      </div>
      
      {/* Regional Overview */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Biblical Geography</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.slice(0, 12).map(region => (
            <div key={region.id} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-blue-800 mb-2">{region.name}</h3>
              <p className="text-sm text-gray-700 mb-2">{region.description}</p>
              <div className="text-xs text-gray-600 space-y-1">
                <div><span className="font-medium">Location:</span> {region.location}</div>
                <div><span className="font-medium">Period:</span> {region.time_period}</div>
                <div><span className="font-medium">Dates:</span> {region.estimated_dates}</div>
              </div>
              {region.notable_people.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Notable People:</div>
                  <div className="flex flex-wrap gap-1">
                    {region.notable_people.slice(0, 4).map((personId: string) => {
                      const person = persons.find(p => p.id === personId);
                      return person ? (
                        <span key={personId} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">
                          {person.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Showing {Math.min(12, regions.length)} of {regions.length} biblical regions
          </p>
        </div>
      </div>
      
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}

export default async function Home() {
  // Read and parse the YAML files
  const ancestryPath = path.join(process.cwd(), 'data', 'claude', 'ancestry.yaml');
  const regionsPath = path.join(process.cwd(), 'data', 'claude', 'regions.yaml');
  
  const ancestryContents = await fs.readFile(ancestryPath, 'utf8');
  const regionsContents = await fs.readFile(regionsPath, 'utf8');
  
  const ancestryData = yaml.load(ancestryContents) as AncestryData;
  const regionsData = yaml.load(regionsContents) as any;

  return <FamilyTree persons={ancestryData.biblical_persons} regions={regionsData.biblical_regions} />;
}
