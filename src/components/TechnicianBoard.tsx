import React, { useState, useEffect } from 'react';
import { TechnicianTask, TaskStatus, TaskChecklist, ChemicalReadings } from '../types';
import { updateTechnicianTask } from '../firebase/services';
import { uploadTaskPhoto, deleteTaskPhoto } from '../firebase/storage';
import {
  HardHat,
  CheckSquare,
  Square,
  FlaskConical,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  Save,
  Camera,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  X,
  FileCheck,
} from 'lucide-react';

interface TechnicianBoardProps {
  tasks: TechnicianTask[];
  onSeedData: () => void;
}

export const TechnicianBoard: React.FC<TechnicianBoardProps> = ({ tasks, onSeedData }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.id || '');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  // Local state for editing the active task
  const [checklist, setChecklist] = useState<Partial<TaskChecklist>>({
    skimmerBaskets: true,
    pumpBasket: true,
    surfaceSkimmed: true,
    tileLineBrushed: true,
    poolVacuumed: false,
    filterBackwashed: false,
    equipmentInspected: true,
    chemicalsAdded: false,
  });

  const [chemicals, setChemicals] = useState<ChemicalReadings>({
    ph: 7.4,
    freeChlorine: 2.5,
    totalAlkalinity: 90,
    calciumHardness: 280,
    cyanuricAcid: 45,
    saltPpm: 3200,
    waterTemperatureF: 78,
    clarity: 'crystal_clear',
  });

  const [taskNotes, setTaskNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // When active task changes, sync local state
  useEffect(() => {
    if (activeTask) {
      if (activeTask.checklist) {
        setChecklist(activeTask.checklist);
      }
      if (activeTask.chemicalReadings) {
        setChemicals(activeTask.chemicalReadings);
      }
      setTaskNotes(activeTask.notes || '');
      setPhotos(activeTask.photoUrls || []);
    }
  }, [activeTask?.id]);

  const toggleChecklistItem = (key: keyof TaskChecklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeTask) return;

    setUploadingPhoto(true);
    setUploadProgress(10);

    const newUploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedUrl = await uploadTaskPhoto(activeTask.id, file, (pct) => {
          setUploadProgress(pct);
        });
        newUploadedUrls.push(uploadedUrl);
      }

      const updatedPhotos = [...photos, ...newUploadedUrls];
      setPhotos(updatedPhotos);

      // Auto-persist uploaded photos to Firestore
      await updateTechnicianTask(activeTask.id, {
        photoUrls: updatedPhotos,
      });

      setSaveMessage(`Uploaded ${files.length} photo(s) to Firebase Storage!`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Photo upload error:', err);
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async (indexToRemove: number, url: string) => {
    if (!activeTask) return;
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    setPhotos(updated);

    try {
      await updateTechnicianTask(activeTask.id, { photoUrls: updated });
      await deleteTaskPhoto(url);
    } catch (err) {
      console.error('Error removing photo:', err);
    }
  };

  const handleAddSamplePhotos = async () => {
    if (!activeTask) return;
    // High-quality illustrative pool maintenance photo evidence
    const samplePhotos = [
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=800&auto=format&fit=crop&q=80',
    ];
    const updated = [...photos, ...samplePhotos];
    setPhotos(updated);
    await updateTechnicianTask(activeTask.id, { photoUrls: updated });
    setSaveMessage('Attached sample handover photo evidence!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveFieldLog = async (newStatus?: TaskStatus) => {
    if (!activeTask) return;
    setSaving(true);
    try {
      await updateTechnicianTask(activeTask.id, {
        status: newStatus || activeTask.status,
        checklist,
        chemicalReadings: chemicals,
        photoUrls: photos,
        notes: taskNotes,
      });
      setSaveMessage(newStatus === 'completed' ? 'Maintenance Visit Marked Complete with Photo Evidence!' : 'Field readings & photos saved successfully!');
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err) {
      console.error('Error updating task:', err);
    } finally {
      setSaving(false);
    }
  };

  // Water chemistry safety evaluations
  const getPhStatus = (ph?: number) => {
    if (ph === undefined) return { label: 'Not tested', color: 'text-slate-400' };
    if (ph >= 7.2 && ph <= 7.6) return { label: 'Optimal Balance', color: 'text-emerald-400' };
    if (ph < 7.2) return { label: 'Acidic (Needs Soda Ash)', color: 'text-rose-400' };
    return { label: 'High pH (Add Muriatic Acid)', color: 'text-amber-400' };
  };

  const getChlorineStatus = (cl?: number) => {
    if (cl === undefined) return { label: 'Not tested', color: 'text-slate-400' };
    if (cl >= 1.0 && cl <= 3.0) return { label: 'Ideal Range', color: 'text-emerald-400' };
    if (cl < 1.0) return { label: 'Low Sanitizer (Needs Shock)', color: 'text-rose-400' };
    return { label: 'High Chlorine', color: 'text-amber-400' };
  };

  const checklistItems: { key: keyof TaskChecklist; label: string }[] = [
    { key: 'skimmerBaskets', label: 'Empty Skimmer Baskets & Weirs' },
    { key: 'pumpBasket', label: 'Inspect & Clean Main Pump Strainer' },
    { key: 'surfaceSkimmed', label: 'Net & Skim Leaves / Debris' },
    { key: 'tileLineBrushed', label: 'Brush Tile Line, Steps & Walls' },
    { key: 'poolVacuumed', label: 'Vacuum Bottom Sediment / Sand' },
    { key: 'filterBackwashed', label: 'Check PSI & Backwash Filter' },
    { key: 'equipmentInspected', label: 'Inspect Speck Pump, Valves & DB Box' },
    { key: 'chemicalsAdded', label: 'Dispense Sanitizers & Water Balancers' },
  ];

  const completedChecksCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Technician Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HardHat className="w-5 h-5 text-cyan-400" />
            Technician Field Log & Photo Evidence Station
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Capture live photo proof of completed maintenance tasks, log chemical readings, and record equipment checks directly to Firebase Storage.
          </p>
        </div>

        {tasks.length === 0 && (
          <button
            onClick={onSeedData}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            Load Sample Field Tasks
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <HardHat className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No technician tasks active</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Schedule a pool maintenance booking to auto-generate technician field tasks.
          </p>
          <div className="mt-4">
            <button
              onClick={onSeedData}
              className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
            >
              Load Demo Technician Schedule
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Assigned Route & Tasks List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Active Service Route ({tasks.length} Assigned Jobs)
            </h3>

            <div className="space-y-2.5">
              {tasks.map((task) => {
                const isSelected = task.id === (activeTask?.id || '');
                const taskPhotoCount = task.photoUrls?.length || 0;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-white truncate">{task.customerName}</p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          task.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : task.status === 'in_progress'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {task.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{task.address}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>Date: {task.scheduledDate}</span>
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-cyan-300 font-medium flex items-center gap-1">
                          <HardHat className="w-3 h-3 shrink-0" />
                          <span>{task.technicianName}</span>
                        </span>
                        {taskPhotoCount > 0 && (
                          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Camera className="w-2.5 h-2.5" />
                            {taskPhotoCount} {taskPhotoCount === 1 ? 'photo' : 'photos'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Field Checklist, Chemical Station, & Photo Uploads */}
          {activeTask && (
            <div className="lg:col-span-2 space-y-5">
              {/* Notification Banner */}
              {saveMessage && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-600/70 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveMessage}</span>
                </div>
              )}

              {/* Task Header Box */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-cyan-400 font-mono">
                      Task ID: {activeTask.id}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{activeTask.customerName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {activeTask.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeTask.status !== 'completed' ? (
                      <button
                        onClick={() => handleSaveFieldLog('completed')}
                        disabled={saving}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete Maintenance
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Visit Completed
                      </span>
                    )}

                    <button
                      onClick={() => handleSaveFieldLog()}
                      disabled={saving}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                  </div>
                </div>

                {/* Photo Evidence Section (Firebase Storage) */}
                <div className="mt-5 pb-5 border-b border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-cyan-400" />
                        Photo Evidence of Completed Maintenance
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Upload job photos (pump & filter installation, clear water, cleaned skimmer) directly to Firebase Storage.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {photos.length === 0 && (
                        <button
                          type="button"
                          onClick={handleAddSamplePhotos}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
                        >
                          + Demo Photos
                        </button>
                      )}
                      <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {photos.length} Attached
                      </span>
                    </div>
                  </div>

                  {/* Upload Drop Area */}
                  <div className="bg-slate-800/50 border border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-4 transition-colors">
                    <label className="flex flex-col sm:flex-row items-center justify-center gap-3 cursor-pointer">
                      <div className="p-3 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="text-center sm:text-left">
                        <span className="text-xs font-bold text-slate-200 block">
                          Click or drag photos to upload directly to Firebase Storage
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Supports JPG, PNG, WEBP • Camera capture supported on mobile
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        disabled={uploadingPhoto}
                        className="hidden"
                      />
                    </label>

                    {/* Progress Bar */}
                    {uploadingPhoto && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[11px] text-cyan-300">
                          <span>Uploading photo to Firebase Storage...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photo Evidence Gallery */}
                  {photos.length > 0 && (
                    <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {photos.map((url, index) => (
                        <div
                          key={index}
                          className="group relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video sm:aspect-square"
                        >
                          <img
                            src={url}
                            alt={`Maintenance proof #${index + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPreviewPhotoUrl(url)}
                              className="p-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
                              title="View full image"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(index, url)}
                              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/80 text-slate-200">
                            Proof #{index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 8-Point Maintenance Checklist */}
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                      8-Point Pool Service Checklist
                    </h4>
                    <span className="text-xs text-cyan-400 font-mono">
                      {completedChecksCount} / {checklistItems.length} completed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {checklistItems.map((item) => {
                      const isChecked = !!checklist[item.key];
                      return (
                        <div
                          key={item.key}
                          onClick={() => toggleChecklistItem(item.key)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer text-xs transition-colors ${
                            isChecked
                              ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-200'
                              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span className={isChecked ? 'font-medium' : ''}>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Water Chemistry Testing Station */}
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-cyan-400" />
                    Water Chemistry Testing & Dosing Log
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* pH */}
                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">pH Level</span>
                        <span className="text-[10px] text-slate-400 font-mono">7.2 - 7.6</span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={chemicals.ph ?? 7.4}
                        onChange={(e) => setChemicals({ ...chemicals, ph: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                      />
                      <p className={`text-[10px] mt-1 font-medium ${getPhStatus(chemicals.ph).color}`}>
                        {getPhStatus(chemicals.ph).label}
                      </p>
                    </div>

                    {/* Free Chlorine */}
                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Free Chlorine</span>
                        <span className="text-[10px] text-slate-400 font-mono">1.0 - 3.0 ppm</span>
                      </div>
                      <input
                        type="number"
                        step="0.1"
                        value={chemicals.freeChlorine ?? 2.5}
                        onChange={(e) => setChemicals({ ...chemicals, freeChlorine: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                      />
                      <p className={`text-[10px] mt-1 font-medium ${getChlorineStatus(chemicals.freeChlorine).color}`}>
                        {getChlorineStatus(chemicals.freeChlorine).label}
                      </p>
                    </div>

                    {/* Alkalinity */}
                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Total Alkalinity</span>
                        <span className="text-[10px] text-slate-400 font-mono">80 - 120 ppm</span>
                      </div>
                      <input
                        type="number"
                        step="5"
                        value={chemicals.totalAlkalinity ?? 90}
                        onChange={(e) => setChemicals({ ...chemicals, totalAlkalinity: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                      />
                      <p className="text-[10px] mt-1 text-slate-400">Target: 80 - 120 ppm</p>
                    </div>

                    {/* Calcium Hardness */}
                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Calcium Hardness</span>
                        <span className="text-[10px] text-slate-400 font-mono">200 - 400</span>
                      </div>
                      <input
                        type="number"
                        step="10"
                        value={chemicals.calciumHardness ?? 280}
                        onChange={(e) => setChemicals({ ...chemicals, calciumHardness: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Salt Level */}
                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Salt Level (ppm)</span>
                        <span className="text-[10px] text-slate-400 font-mono">2700 - 3400</span>
                      </div>
                      <input
                        type="number"
                        step="50"
                        value={chemicals.saltPpm ?? 3200}
                        onChange={(e) => setChemicals({ ...chemicals, saltPpm: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Water Clarity */}
                    <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/80">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-semibold">Visual Clarity</span>
                      </div>
                      <select
                        value={chemicals.clarity || 'crystal_clear'}
                        onChange={(e) => setChemicals({ ...chemicals, clarity: e.target.value as any })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="crystal_clear">Crystal Clear</option>
                        <option value="slightly_cloudy">Slightly Cloudy</option>
                        <option value="cloudy">Cloudy / Hazy</option>
                        <option value="green_algae">Algae Present</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Field Notes */}
                <div className="mt-5 pt-4 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Technician Service Notes for Customer Report
                  </label>
                  <textarea
                    rows={2}
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder="e.g. Added 1 lb granular shock, brushed wall algae behind ladder, filter pressure at normal 12 PSI..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3.5 bg-slate-950 border-b border-slate-800 text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <FileCheck className="w-4 h-4" />
                Firebase Storage Photo Evidence
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[80vh] overflow-hidden bg-black/40">
              <img
                src={previewPhotoUrl}
                alt="Enlarged pool maintenance evidence"
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
