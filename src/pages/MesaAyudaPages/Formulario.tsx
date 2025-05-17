import React, { useState } from 'react';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from '../../components/common/ComponentCard';
import { TrashBinIcon } from '../../icons';
import axios from '../../lib/axios';
import Input from '../../components/form/input/InputField';

type FieldType = 'text' | 'number' | 'select' | 'email';

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  defaultValue: string;
  options?: string[];
}

const Formulario: React.FC = () => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [draggedItem, setDraggedItem] = useState<FormField | null>(null);

  const handleDrop = (type: FieldType) => {
    const id = Date.now().toString();
    setFormFields(prev => [
      ...prev,
      {
        id,
        type,
        label: '',
        defaultValue: '',
        options: type === 'select' ? [] : undefined,
      }
    ]);
  };

  const handleFieldChange = (id: string, updatedField: Partial<FormField>) => {
    setFormFields(prev =>
      prev.map(field => field.id === id ? { ...field, ...updatedField } : field)
    );
  };

  const removeField = (id: string) => {
    setFormFields(prev => prev.filter(f => f.id !== id));
  };

  const exportJSON = async () => {
    const json = JSON.stringify({
      formName,
      fields: formFields
    }, null, 2);
    setJsonOutput(json);

    try {
      const response = await axios.post('/templates', {
        name: formName,
        fields: formFields,
      });
      const formId = response.data.id;

      window.open(`/ver-formulario?id=${formId}`, '_blank');
    } catch (error) {
      console.error('Ocurrió un error al guardar el formulario:', error);
    }
  };

  // Funciones para el reordenamiento con drag and drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, field: FormField) => {
    setDraggedItem(field);
    e.dataTransfer.setData('text/plain', field.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnForm = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as FieldType;
    if (type) {
      handleDrop(type);
      return;
    }

    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || !draggedItem) return;

    const draggedIndex = formFields.findIndex(f => f.id === draggedId);
    if (draggedIndex === -1) return;

    // Verificar si el drop fue en un área específica o en el contenedor general
    const dropY = e.clientY;
    const formContainer = e.currentTarget.getBoundingClientRect();
    const relativeY = dropY - formContainer.top;

    // Encontrar la posición de inserción basada en la posición Y del mouse
    let newIndex = formFields.length;
    for (let i = 0; i < formFields.length; i++) {
      const fieldElement = document.getElementById(`field-${formFields[i].id}`);
      if (fieldElement) {
        const fieldRect = fieldElement.getBoundingClientRect();
        const fieldMiddle = fieldRect.top + fieldRect.height / 2 - formContainer.top;
        if (relativeY < fieldMiddle) {
          newIndex = i;
          break;
        }
      }
    }

    // Si el elemento se está moviendo a la misma posición, no hacer nada
    if (newIndex === draggedIndex || newIndex === draggedIndex + 1) {
      setDraggedItem(null);
      return;
    }

    // Reordenar los campos
    const newFields = [...formFields];
    const [removed] = newFields.splice(draggedIndex, 1);
    newFields.splice(newIndex, 0, removed);

    setFormFields(newFields);
    setDraggedItem(null);
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Formulario Mesa de Ayuda" />

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Columna izquierda */}
        <div className="flex-1 space-y-6 order-1 xl:order-1">
          {/* Tipo de Dato */}
          <ComponentCard title="Tipos de Datos">
            <div className="space-y-4">
              {(['text', 'number', 'select', 'email'] as FieldType[]).map(type => (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('type', type)}
                  className="bg-white hover:bg-blue-200 p-2 rounded-lg text-center cursor-grab font-medium transition shadow-sm"
                >
                  {type === 'text' && '📝 Campo de Texto'}
                  {type === 'number' && '🔢 Campo Numérico'}
                  {type === 'select' && '📋 Campo Seleccionable'}
                  {type === 'email' && '📧 Campo de Email'}
                </div>
              ))}
            </div>
          </ComponentCard>

          {/* Formulario */}
          <ComponentCard title="Formulario">
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="mx-auto"
              placeholder="Nombre del Formulario"
            />
            <div
              className="min-h-[300px] border border-dashed border-gray-400 p-4 rounded-lg bg-white"
              onDragOver={handleDragOver}
              onDrop={handleDropOnForm}
            >
              {formFields.length === 0 && (
                <p className="text-gray-400 text-center">Arrastra campos desde arriba</p>
              )}
              {formFields.map((field, index) => (
                <div
                  id={`field-${field.id}`}
                  key={field.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, field)}
                  className={`bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4 relative shadow-sm ${
                    draggedItem?.id === field.id ? 'opacity-50 border-blue-500' : 'opacity-100'
                  }`}
                >
                  <button
                    className="absolute top-2 right-2 hover:bg-red-600 p-1 rounded"
                    onClick={() => removeField(field.id)}
                    title="Eliminar campo"
                  >
                    <TrashBinIcon className="h-5 w-5 text-red-500 hover:text-white transition" />
                  </button>

                  <input
                    type="text"
                    className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Etiqueta del campo"
                    value={field.label}
                    onChange={(e) =>
                      handleFieldChange(field.id, { label: e.target.value })
                    }
                  />

                  {field.type === 'select' ? (
                    <>
                      <input
                        type="text"
                        className="w-full mb-3 p-2 border rounded focus:outline-none"
                        placeholder="Opciones separadas por coma"
                        onChange={(e) => {
                          const options = e.target.value.split(',').map(opt => opt.trim());
                          handleFieldChange(field.id, { options });
                        }}
                      />
                      <select className="w-full p-2 border rounded text-gray-700 bg-white">
                        {(field.options || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <input
                      type={field.type}
                      className="w-full p-2 border rounded focus:outline-none"
                      placeholder={`Valor por defecto (${field.type})`}
                      value={field.defaultValue}
                      onChange={(e) =>
                        handleFieldChange(field.id, { defaultValue: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={exportJSON}
              className="mt-4 bg-green-600 hover:bg-green-700 transition text-white px-3 py-1 rounded shadow"
            >
              Guardar Formulario
            </button>

            {jsonOutput && (
              <pre className="mt-4 p-4 bg-black text-green-400 text-sm rounded-lg overflow-x-auto max-h-96 whitespace-pre">
                {jsonOutput}
              </pre>
            )}
          </ComponentCard>
        </div>

        {/* Columna derecha: Previsualización */}
        <div className="flex-1 order-2 xl:order-2">
          {formFields.length >= 0 && (
            <ComponentCard title="Previsualización del Formulario">
              <div className="space-y-3">
                {formFields.map(field => (
                  <div key={field.id} className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                    {field.type === 'select' ? (
                      <select className="mt-2 w-full p-2 border rounded bg-gray-50 text-gray-700">
                        {(field.options || []).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        className="mt-2 w-full p-2 border rounded bg-gray-50 text-gray-700"
                        value={field.defaultValue}
                        disabled
                      />
                    )}
                  </div>
                ))}
              </div>
            </ComponentCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Formulario;