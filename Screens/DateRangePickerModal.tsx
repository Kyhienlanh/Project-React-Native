import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (label: string, startDate: Date, endDate: Date) => void;
}

const DateRangePickerModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const now = new Date();
  const [selected, setSelected] = useState<string>('month');

  // Tùy chỉnh ngày
  const [customStart, setCustomStart] = useState(new Date());
  const [customEnd, setCustomEnd] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const ranges = {
    week: {
      label: 'Tuần này',
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7),
    },
    month: {
      label: 'Tháng này',
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    },
    quarter: {
      label: 'Quý này',
      start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
      end: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0),
    },
    year: {
      label: 'Năm nay',
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear(), 11, 31),
    },
    custom: {
      label: 'Tùy chỉnh',
      start: customStart,
      end: customEnd,
    },
  };

  const formatDate = (date: Date) =>
    `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;

  const handleSave = () => {
    const { label, start, end } = ranges[selected as keyof typeof ranges];
    onSave(label, start, end);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.modalContainer}>
        <View style={styles.modal}>
          <Text style={styles.header}>Khoảng thời gian</Text>

          {Object.entries(ranges).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={styles.option}
              onPress={() => setSelected(key)}
            >
              <Ionicons
                name={selected === key ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color="#2ecc71"
              />
              <Text style={styles.label}>
                {value.label}{' '}
                {key !== 'custom'
                  ? `(${formatDate(value.start)} - ${formatDate(value.end)})`
                  : ''}
              </Text>
            </TouchableOpacity>
          ))}

          {selected === 'custom' && (
            <View style={{ marginTop: 10 }}>
              <TouchableOpacity onPress={() => setShowPicker('start')}>
                <Text>📅 Từ ngày: {formatDate(customStart)}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPicker('end')}>
                <Text>📅 Đến ngày: {formatDate(customEnd)}</Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={showPicker === 'start' ? customStart : customEnd}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      if (showPicker === 'start') setCustomStart(selectedDate);
                      else setCustomEnd(selectedDate);
                    }
                    setShowPicker(null);
                  }}
                />
              )}
            </View>
          )}

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.save} onPress={handleSave}>
              <Text style={{ color: '#fff' }}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateRangePickerModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancel: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  save: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
});
