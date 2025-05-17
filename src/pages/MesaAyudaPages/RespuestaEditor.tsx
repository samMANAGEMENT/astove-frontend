import React, { useState, useEffect, useRef } from 'react';
import ComponentCard from '../../components/common/ComponentCard';
import { TrashBinIcon } from '../../icons';
import axios from '../../lib/axios';
import Input from '../../components/form/input/InputField';

type FieldType = 'text' | 'number' | 'select';

interface RespuestaEditorProps {
  respuestaId: number | null;
  onClose: () => void;
}

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  defaultValue: string;
  options?: string[];
}

const RespuestaEditor: React.FC<RespuestaEditorProps> = ({ respuestaId, onClose }) => {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFormulario = async () => {
      if (!respuestaId) return;

      try {
        const response = await axios.get(`/templates/${respuestaId}`);
        const { name, fields } = response.data;

        setFormName(name);
        setFormFields(fields);
      } catch (error) {
        console.error('Error al obtener el formulario:', error);
      }
    };

    fetchFormulario();
  }, [respuestaId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleDrop = (type: FieldType) => {
    const id = crypto.randomUUID();
    setFormFields((prev) => [
      ...prev,
      {
        id,
        type,
        label: '',
        defaultValue: '',
        options: type === 'select' ? [] : undefined,
      },
    ]);
  };

  const handleFieldChange = (id: string, updatedField: Partial<FormField>) => {
    setFormFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...updatedField } : field))
    );
  };

  const removeField = (id: string) => {
    setFormFields((prev) => prev.filter((f) => f.id !== id));
  };

  const exportJSON = async () => {
    const json = JSON.stringify(formFields, null, 2);
    setJsonOutput(json);

    if (!respuestaId) {
      console.error('No se recibió un ID válido para actualizar el formulario.');
      return;
    }

    try {
      const response = await axios.put(`/templates/${respuestaId}`, {
        name: formName,
        fields: formFields,
      });

      const formId = respuestaId;

      window.open(`/ver-formulario?id=${formId}`, '_blank');
      onClose();
    } catch (error) {
      console.error('Ocurrió un error al actualizar el formulario:', error);
    }
  };


  return (
    <div className="pt-28 fixed inset-0 flex justify-center items-center backdrop-blur-md bg-white/30 z-50 p-4">
      <div
        ref={modalRef}
        className="relative bg-white text-black rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex-1 space-y-3">
          <div className="space-y-2">
            {(['text', 'number', 'select'] as FieldType[]).map((type) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('type', type)}
                className="bg-white hover:bg-blue-200 p-2 rounded-lg text-center cursor-grab font-medium transition shadow-sm"
              >
                {type === 'text' && '📝 Campo de Texto'}
                {type === 'number' && '🔢 Campo Numérico'}
                {type === 'select' && '📋 Campo Seleccionable'}
              </div>
            ))}
          </div>

          <ComponentCard title="Formulario">
            <Input
              value={formName ?? ''}
              onChange={(e) => setFormName(e.target.value)}
              className="mx-auto"
              placeholder="Nombre del Formulario"
            />
            <div
              className="min-h-[300px] border border-dashed border-gray-400 p-4 rounded-lg bg-white"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const type = e.dataTransfer.getData('type') as FieldType;
                handleDrop(type);
              }}
            >
              {formFields.length === 0 && (
                <p className="text-gray-400 text-center">Arrastra campos desde arriba</p>
              )}
              {formFields.map((field) => (
                <div
                  key={field.id}
                  className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4 relative shadow-sm"
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
                    value={field.label ?? ''}
                    onChange={(e) => handleFieldChange(field.id, { label: e.target.value })}
                  />

                  {field.type === 'select' ? (
                    <>
                      <input
                        type="text"
                        className="w-full mb-3 p-2 border rounded focus:outline-none"
                        placeholder="Opciones separadas por coma"
                        onChange={(e) => {
                          const options = e.target.value.split(',').map((opt) => opt.trim());
                          handleFieldChange(field.id, { options });
                        }}
                      />
                      <select className="w-full p-2 border rounded text-gray-700 bg-white">
                        {(field.options ?? []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <input
                      type={field.type}
                      className="w-full p-2 border rounded focus:outline-none"
                      placeholder={`Valor por defecto (${field.type})`}
                      value={field.defaultValue ?? ''}
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

            <button
              onClick={onClose}
              className="mt-4 bg-red-500 ml-2  hover:bg-red-600 transition text-white px-3 py-1 rounded shadow"
            >
              Cerrar
            </button>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
};

export default RespuestaEditor;
