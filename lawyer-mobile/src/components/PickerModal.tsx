import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/theme";

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: Option[];
  selectedIds: string[];
  multiple?: boolean;
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export function PickerModal({
  visible,
  title,
  options,
  selectedIds,
  multiple = false,
  onClose,
  onConfirm,
  searchValue,
  onSearchChange,
}: PickerModalProps) {
  const toggle = (id: string) => {
    if (multiple) {
      const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
      onConfirm(next);
    } else {
      onConfirm([id]);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          {multiple ? (
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 26 }} />
          )}
        </View>

        {onSearchChange && (
          <TextInput
            style={styles.search}
            placeholder="Search..."
            value={searchValue}
            onChangeText={onSearchChange}
            placeholderTextColor="#9CA3AF"
          />
        )}

        <FlatList
          data={options}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const selected = selectedIds.includes(item.id);
            return (
              <TouchableOpacity style={styles.row} onPress={() => toggle(item.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.sublabel && <Text style={styles.rowSub}>{item.sublabel}</Text>}
                </View>
                {selected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No results</Text>}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  doneText: { fontSize: 15, fontWeight: "700", color: colors.primary },
  search: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowLabel: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 40 },
});
