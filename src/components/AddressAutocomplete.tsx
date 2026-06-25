import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInputProps,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { searchAddresses, GeoPoint } from '../services/geocodingService';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  // Se llama al elegir una sugerencia: trae el texto y las coordenadas.
  onSelect: (point: GeoPoint) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  inputStyle?: TextInputProps['style'];
  containerStyle?: object;
}

/**
 * Input con autocompletado de direcciones (Nominatim/OpenStreetMap).
 * Busca con debounce mientras se escribe y muestra un desplegable de
 * sugerencias. Al elegir una, entrega el texto y las coordenadas (GeoPoint).
 */
export default function AddressAutocomplete({
  value,
  onChangeText,
  onSelect,
  placeholder,
  icon,
  inputStyle,
  containerStyle,
}: Props) {
  const [suggestions, setSuggestions] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  // Cuando el usuario elige una sugerencia, evitamos relanzar la búsqueda.
  const skipNextSearch = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddresses(q);
      setSuggestions(results);
      setOpen(results.length > 0);
      setLoading(false);
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const handlePick = (point: GeoPoint) => {
    skipNextSearch.current = true;
    // El displayName de Nominatim es muy largo ("Calle, Comuna, Región,
    // Chile"). Para la UI y para el filtro por texto usamos el primer segmento
    // (nombre corto); las coordenadas exactas viajan en onSelect.
    const shortName = point.displayName.split(',')[0].trim();
    onChangeText(shortName);
    onSelect(point);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.inputRow}>
        {icon ? <View style={styles.iconBox}>{icon}</View> : null}
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : null}
      </View>

      {open && (
        <View style={[styles.dropdown, SHADOWS.card]}>
          {suggestions.map((s, idx) => (
            <TouchableOpacity
              key={`${s.lat}-${s.lng}-${idx}`}
              style={[styles.item, idx < suggestions.length - 1 && styles.itemBorder]}
              onPress={() => handlePick(s)}
              activeOpacity={0.7}
            >
              <MapPin color={COLORS.primary} size={16} strokeWidth={2.5} />
              <Text style={styles.itemText} numberOfLines={2}>
                {s.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 50,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sm,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    padding: 0,
    margin: 0,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    zIndex: 100,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemText: {
    flex: 1,
    fontSize: FONTS.xs,
    color: COLORS.textPrimary,
  },
});
