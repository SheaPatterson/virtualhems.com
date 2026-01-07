"use client";

import React, { useMemo, useEffect } from 'react';
import { StepProps, Location } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Hospital as HospitalIcon, ArrowRight, Activity, Zap, Crosshair, HeartPulse, Plane } from 'lucide-react';
import { HemsBase, Hospital } from '@/data/hemsData';
import { toast } from 'sonner';
import SceneLocationSelector from './SceneLocationSelector';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Step1Details: React.FC<StepProps> = ({ formState, updateFormState, onNext, hospitals, bases, helicopters }) => {
    const { missionType, selectedBaseId, selectedHelicopter, selectedDestinationId, selectedOriginId, selectedFinalHospitalId, selectedSceneLocation } = formState;

    const traumaCenters = useMemo(() => hospitals.filter(h => h.isTraumaCenter), [hospitals]);

    // AUTO-SELECT HELICOPTER WHEN BASE CHANGES
    useEffect(() => {
        if (selectedBaseId) {
            const base = bases.find(b => b.id === selectedBaseId);
            if (base?.helicopterId) {
                const aircraft = helicopters.find(h => h.id === base.helicopterId);
                if (aircraft && selectedHelicopter?.id !== aircraft.id) {
                    updateFormState({ selectedHelicopter: aircraft });
                    toast.info(`Assigned ${aircraft.registration} for ${base.name}.`);
                }
            } else {
                updateFormState({ selectedHelicopter: null });
            }
        }
    }, [selectedBaseId, bases, helicopters, updateFormState, selectedHelicopter?.id]);

    const handleNextStep = () => {
        if (!selectedBaseId) {
            toast.error("Required: Select HEMS Base.");
            return;
        }

        if (!selectedHelicopter) {
            toast.error("Operational Error: No aircraft assigned to this base. Contact maintenance.");
            return;
        }

        if (missionType === "Hospital Transfer") {
            if (!selectedOriginId || !selectedDestinationId) {
                toast.error("Required: Origin and Destination facilities.");
                return;
            }
        } else { // Scene Call
            if (!selectedFinalHospitalId) {
                toast.error("Required: Receiving Trauma Center.");
                return;
            }
        }

        onNext();
    };

    const renderHospitalSelect = (
        id: keyof typeof formState, 
        label: string, 
        value: string | null, 
        hospitalList: Hospital[],
        placeholder: string,
        icon: React.ReactNode
    ) => (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                {icon} <span className="ml-2">{label}</span>
            </Label>
            <Select
                value={value || ''}
                onValueChange={(val) => updateFormState({ [id]: val })}
            >
                <SelectTrigger id={id} className="h-12 border-2 bg-background font-bold">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {hospitalList.map((h) => (
                        <SelectItem key={h.id} value={h.id} className="font-medium">
                            {h.name} <span className="text-[10px] opacity-50 ml-2">({h.city})</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Mission Profile Selection */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => updateFormState({ missionType: 'Scene Call' })}
                    className={cn(
                        "p-6 rounded-2xl border-2 transition-all flex flex-col items-center space-y-3",
                        missionType === 'Scene Call' ? "bg-primary/10 border-primary shadow-lg ring-4 ring-primary/5" : "bg-muted/50 border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                    )}
                >
                    <Activity className={cn("w-8 h-8", missionType === 'Scene Call' ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-black uppercase tracking-tighter text-sm italic">Scene Call</span>
                </button>
                <button 
                    onClick={() => updateFormState({ missionType: 'Hospital Transfer' })}
                    className={cn(
                        "p-6 rounded-2xl border-2 transition-all flex flex-col items-center space-y-3",
                        missionType === 'Hospital Transfer' ? "bg-primary/10 border-primary shadow-lg ring-4 ring-primary/5" : "bg-muted/50 border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                    )}
                >
                    <HospitalIcon className={cn("w-8 h-8", missionType === 'Hospital Transfer' ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-black uppercase tracking-tighter text-sm italic">Transfer</span>
                </button>
            </div>

            <Separator className="opacity-50" />

            {/* Locked Base & Asset Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                        <MapPin className="w-3 h-3 text-primary mr-2" /> Dispatch Base
                    </Label>
                    <Select
                        value={selectedBaseId || ''}
                        onValueChange={(val) => updateFormState({ selectedBaseId: val })}
                    >
                        <SelectTrigger className="h-12 border-2 bg-background font-bold italic">
                            <SelectValue placeholder="Select Deployment Base" />
                        </SelectTrigger>
                        <SelectContent>
                            {bases.map((base: HemsBase) => (
                                <SelectItem key={base.id} value={base.id} className="font-medium italic">
                                    {base.name.toUpperCase()} <span className="text-[10px] opacity-50 ml-2">({base.faaIdentifier})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center">
                        <Plane className="w-3 h-3 text-primary mr-2" /> Assigned Asset (Stationary)
                    </Label>
                    <div className="h-12 border-2 rounded-md bg-muted/30 flex items-center px-4 font-black italic text-primary">
                        <Zap className="w-4 h-4 mr-2" />
                        {selectedHelicopter ? `${selectedHelicopter.registration} (${selectedHelicopter.model})` : 'Awaiting Base Selection...'}
                    </div>
                    {selectedBaseId && !selectedHelicopter && (
                        <p className="text-[10px] text-destructive font-bold animate-pulse">WARNING: No aircraft assigned to this station.</p>
                    )}
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Route Logic */}
            <Card className="border-2 border-primary/5 bg-primary/[0.02]">
                <CardContent className="p-6">
                    {missionType === "Hospital Transfer" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {renderHospitalSelect('selectedOriginId', 'Origin Facility', selectedOriginId, hospitals, "Pickup Hospital", <MapPin className="w-3 h-3" />)}
                            {renderHospitalSelect('selectedDestinationId', 'Receiving Facility', selectedDestinationId, hospitals, "Drop-off Hospital", <HospitalIcon className="w-3 h-3" />)}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-end gap-6">
                                <div className="flex-grow space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scene Designation</Label>
                                    <div className="h-12 border-2 rounded-md bg-background flex items-center px-4 font-bold text-primary italic">
                                        <Crosshair className="w-4 h-4 mr-2" />
                                        {selectedSceneLocation?.name || 'Awaiting Pin Drop...'}
                                    </div>
                                </div>
                                <SceneLocationSelector 
                                    currentLocation={selectedSceneLocation}
                                    onLocationSelect={(l: Location) => updateFormState({ selectedSceneLocation: l })}
                                />
                            </div>
                            
                            {renderHospitalSelect(
                                'selectedFinalHospitalId', 
                                'Receiving Trauma Center', 
                                selectedFinalHospitalId, 
                                traumaCenters, 
                                "Select Destination",
                                <HeartPulse className="w-3 h-3" />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button onClick={handleNextStep} size="lg" className="h-14 px-12 font-black italic rounded-xl shadow-xl w-full sm:w-auto">
                    LOG CREW ROSTER <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default Step1Details;