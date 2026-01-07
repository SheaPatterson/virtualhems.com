import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepProps, PatientGender } from './types.ts';
import { ArrowLeft, ArrowRight, HeartPulse, FileText, User, Zap, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { autoGeneratePatient } from '@/utils/mockDataGenerator';

const Step3Patient: React.FC<StepProps> = ({ formState, updateFormState, onNext, onBack }) => {
    const { patientAge, patientGender, patientWeightLbs, patientDetails, medicalResponse } = formState;

    const handleAutoGenerate = () => {
        const data = autoGeneratePatient();
        updateFormState(data);
        toast.success("Patient data auto-generated.");
    };

    const handleNextStep = () => {
        if (!patientDetails || !medicalResponse) {
            toast.error("Please provide patient details and medical response notes.");
            return;
        }
        onNext();
    };

    const genderOptions: PatientGender[] = ['Male', 'Female', 'Other'];

    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                <div className="flex items-center space-x-2 text-lg font-semibold mb-4">
                    <HeartPulse className="w-5 h-5 text-primary" />
                    <span>Patient and Medical Information</span>
                </div>
                
                <Button onClick={handleAutoGenerate} variant="secondary" className="w-full">
                    <Zap className="w-4 h-4 mr-2" /> Auto-Generate Patient Data
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Age */}
                    <div className="space-y-2">
                        <Label htmlFor="patientAge" className="flex items-center">
                            <User className="w-4 h-4 mr-1" /> Age (Years)
                        </Label>
                        <Input
                            id="patientAge"
                            type="number"
                            placeholder="e.g., 45"
                            value={patientAge}
                            onChange={(e) => updateFormState({ patientAge: e.target.value })}
                        />
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                        <Label htmlFor="patientGender" className="flex items-center">
                            <User className="w-4 h-4 mr-1" /> Gender
                        </Label>
                        <Select
                            value={patientGender}
                            onValueChange={(val) => updateFormState({ patientGender: val as PatientGender })}
                        >
                            <SelectTrigger id="patientGender">
                                <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                {genderOptions.map(gender => (
                                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Weight */}
                    <div className="space-y-2">
                        <Label htmlFor="patientWeightLbs" className="flex items-center">
                            <Scale className="w-4 h-4 mr-1" /> Weight (Lbs)
                        </Label>
                        <Input
                            id="patientWeightLbs"
                            type="number"
                            placeholder="e.g., 180"
                            value={patientWeightLbs}
                            onChange={(e) => updateFormState({ patientWeightLbs: e.target.value })}
                        />
                    </div>
                </div>

                {/* Patient Details */}
                <div className="space-y-2">
                    <Label htmlFor="patientDetails" className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" /> Patient Details / Chief Complaint
                    </Label>
                    <Textarea
                        id="patientDetails"
                        placeholder="Brief description of the patient's condition, mechanism of injury, or reason for transfer."
                        rows={4}
                        value={patientDetails}
                        onChange={(e) => updateFormState({ patientDetails: e.target.value })}
                    />
                </div>

                {/* Medical Response */}
                <div className="space-y-2">
                    <Label htmlFor="medicalResponse" className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" /> Medical Response Notes
                    </Label>
                    <Textarea
                        id="medicalResponse"
                        placeholder="Initial interventions, medications administered, vital signs, and ongoing care plan."
                        rows={4}
                        value={medicalResponse}
                        onChange={(e) => updateFormState({ medicalResponse: e.target.value })}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={onBack} variant="outline" className="flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleNextStep} className="flex items-center">
                    Next: Flight Plan <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default Step3Patient;