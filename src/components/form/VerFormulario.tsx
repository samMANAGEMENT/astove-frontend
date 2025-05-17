import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import axios from '../../lib/axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormField {
    id: string;
    type: 'text' | 'number' | 'select';
    label: string;
    defaultValue: string;
    options?: string[];
}

const VerFormulario: React.FC = () => {
    const [searchParams] = useSearchParams();
    const formId = searchParams.get('id');
    const [formName, setFormName] = useState('');
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const response = await axios.get(`/templates/${formId}`);
                setFormFields(response.data.fields);
                setFormName(response.data.name);

                const initialValues: Record<string, string> = {};
                response.data.fields.forEach((field: FormField) => {
                    initialValues[field.id] = field.defaultValue || '';
                });
                setFormValues(initialValues);
            } catch (error) {
                console.error('Error al cargar el formulario:', error);
                toast.error('Hubo un error al cargar el formulario');
            }
        };

        if (formId) fetchForm();
    }, [formId]);

    const handleChange = (id: string, value: string) => {
        setFormValues(prev => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const submissionArray = Object.entries(formValues).map(([id, value]) => {
            const field = formFields.find(f => f.id === id);
            return {
                label: field ? field.label : id,
                value,
            };
        });

        try {
            const response = await axios.post('/submissions', {
                ticket_template_id: formId,
                submission: submissionArray,
            });
            
            // Mostrar notificación de éxito
            toast.success('Formulario enviado correctamente');

            console.log('JSON enviado:', JSON.stringify({ formId, submission: submissionArray }, null, 2));
            console.log('Respuesta del servidor:', response.data);

            // Limpiar los campos del formulario
            setFormValues({});  // Vaciar todos los campos visualmente
        } catch (error) {
            console.error('Error al enviar los datos del formulario:', error);
            toast.error('Hubo un error al enviar el formulario');
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <ToastContainer />
            <h1 className="text-2xl font-semibold mb-6">{formName}</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
                {formFields.map(field => (
                    <div key={field.id} className="bg-white p-4 rounded shadow border">
                        <label className="block font-medium text-gray-700 mb-2">{field.label}</label>
                        {field.type === 'select' ? (
                            <select
                                className="w-full p-2 border rounded"
                                value={formValues[field.id] || ''}  // Usa el valor actual del estado
                                onChange={(e) => handleChange(field.id, e.target.value)}
                            >
                                <option value="">Seleccione una opción</option>
                                {(field.options || []).map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                className="w-full p-2 border rounded"
                                value={formValues[field.id] || ''}  // Usa el valor actual del estado
                                onChange={(e) => handleChange(field.id, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Enviar Formulario
                </button>
            </form>
        </div>
    );
};

export default VerFormulario;
