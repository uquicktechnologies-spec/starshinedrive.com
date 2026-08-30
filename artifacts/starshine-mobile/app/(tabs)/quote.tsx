import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCreateInquiry } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { PRODUCT_INTEREST_OPTIONS } from '@/constants/products';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  productInterest: string[];
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  productInterest?: string;
  message?: string;
}

const EMPTY_FORM: FormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  productInterest: [],
  message: '',
};

export default function QuoteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const createInquiry = useCreateInquiry();

  const companyRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const messageRef = useRef<TextInput>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (form.productInterest.length === 0) newErrors.productInterest = 'Please select at least one product';
    if (!form.message.trim()) newErrors.message = 'Please describe your requirements';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setSubmitError('');
    createInquiry.mutate(
      {
        data: {
          contactPerson: form.name.trim(),
          companyName: form.company.trim() || undefined,
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          leadSource: 'Mobile quote form',
          productInterest: form.productInterest,
          message: form.message.trim(),
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: () => {
          setSubmitError('We could not save your request. Please try again or contact us directly.');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        },
      },
    );
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError('');
    setSubmitted(false);
    createInquiry.reset();
  }

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ height: topPad }} />
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.primary + '15' }]}>
            <MaterialCommunityIcons name="check-circle" size={56} color={colors.primary} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
            Request Submitted!
          </Text>
          <Text style={[styles.successDesc, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
            Thank you, {form.name.split(' ')[0]}. Our team will review your request and get back to you within 1–2 business days at {form.email}.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1, marginTop: 8 }]}
            onPress={handleReset}
          >
            <Text style={[styles.submitBtnText, { fontFamily: 'IBMPlexSans_600SemiBold' }]}>
              Submit Another Request
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: 'IBMPlexSans_700Bold' }]}>
          Request a Quote
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
          Fill in your details and we'll respond within 1–2 business days
        </Text>
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.formContent,
          { paddingBottom: Platform.OS === 'web' ? 84 + 34 : 100 },
        ]}
        bottomOffset={60}
        keyboardShouldPersistTaps="handled"
      >
        {/* Full Name */}
        <FormField label="Full Name" required error={errors.name}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: errors.name ? colors.destructive : colors.border,
                color: colors.foreground,
                fontFamily: 'IBMPlexSans_400Regular',
              },
            ]}
            placeholder="John Smith"
            placeholderTextColor={colors.mutedForeground}
            value={form.name}
            onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); setErrors((e) => ({ ...e, name: undefined })); }}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => companyRef.current?.focus()}
            testID="quote-name"
          />
        </FormField>

        {/* Company */}
        <FormField label="Company Name">
          <TextInput
            ref={companyRef}
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'IBMPlexSans_400Regular' },
            ]}
            placeholder="Acme Industries (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={form.company}
            onChangeText={(v) => setForm((f) => ({ ...f, company: v }))}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        </FormField>

        {/* Email */}
        <FormField label="Email Address" required error={errors.email}>
          <TextInput
            ref={emailRef}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: errors.email ? colors.destructive : colors.border,
                color: colors.foreground,
                fontFamily: 'IBMPlexSans_400Regular',
              },
            ]}
            placeholder="john@company.com"
            placeholderTextColor={colors.mutedForeground}
            value={form.email}
            onChangeText={(v) => { setForm((f) => ({ ...f, email: v })); setErrors((e) => ({ ...e, email: undefined })); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            testID="quote-email"
          />
        </FormField>

        {/* Phone */}
        <FormField label="Phone Number">
          <TextInput
            ref={phoneRef}
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: 'IBMPlexSans_400Regular' },
            ]}
            placeholder="+1 (555) 000-0000 (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={form.phone}
            onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
            keyboardType="phone-pad"
            returnKeyType="next"
          />
        </FormField>

        {/* Products Interested */}
        <FormField label="Products Interested" required error={errors.productInterest}>
          <Pressable
            style={[
              styles.input,
              styles.selectInput,
              {
                backgroundColor: colors.card,
                borderColor: errors.productInterest ? colors.destructive : colors.border,
              },
            ]}
            onPress={() => setShowProductPicker((v) => !v)}
            testID="quote-product"
          >
            <Text
              style={[
                styles.selectText,
                {
                  color: form.productInterest.length ? colors.foreground : colors.mutedForeground,
                  fontFamily: 'IBMPlexSans_400Regular',
                },
              ]}
              numberOfLines={2}
            >
              {form.productInterest.length
                ? `${form.productInterest.length} selected: ${form.productInterest.join(', ')}`
                : 'Select one or more products…'}
            </Text>
            <Feather
              name={showProductPicker ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.mutedForeground}
            />
          </Pressable>

          {showProductPicker && (
            <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {PRODUCT_INTEREST_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    {
                      backgroundColor:
                        form.productInterest.includes(option)
                          ? colors.primary + '12'
                          : pressed
                          ? colors.muted
                          : 'transparent',
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setForm((f) => ({
                      ...f,
                      productInterest: f.productInterest.includes(option)
                        ? f.productInterest.filter((selected) => selected !== option)
                        : [...f.productInterest, option],
                    }));
                    setErrors((e) => ({ ...e, productInterest: undefined }));
                    Haptics.selectionAsync();
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      {
                        color: form.productInterest.includes(option) ? colors.primary : colors.foreground,
                        fontFamily: form.productInterest.includes(option) ? 'IBMPlexSans_500Medium' : 'IBMPlexSans_400Regular',
                      },
                    ]}
                  >
                    {option}
                  </Text>
                  {form.productInterest.includes(option) && (
                    <Feather name="check" size={14} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </FormField>

        {/* Message */}
        <FormField label="Application / Requirements" required error={errors.message}>
          <TextInput
            ref={messageRef}
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.card,
                borderColor: errors.message ? colors.destructive : colors.border,
                color: colors.foreground,
                fontFamily: 'IBMPlexSans_400Regular',
              },
            ]}
            placeholder="Describe your application, torque requirements, speed, mounting, environment, quantity…"
            placeholderTextColor={colors.mutedForeground}
            value={form.message}
            onChangeText={(v) => { setForm((f) => ({ ...f, message: v })); setErrors((e) => ({ ...e, message: undefined })); }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            returnKeyType="done"
            testID="quote-message"
          />
        </FormField>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: colors.primary, opacity: createInquiry.isPending || pressed ? 0.75 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={createInquiry.isPending}
          testID="quote-submit"
        >
          {createInquiry.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={[styles.submitBtnText, { fontFamily: 'IBMPlexSans_600SemiBold' }]}>
                Submit Request
              </Text>
              <Feather name="send" size={16} color="#FFFFFF" />
            </>
          )}
        </Pressable>

        {submitError ? (
          <Text style={[styles.submitError, { color: colors.destructive, fontFamily: 'IBMPlexSans_400Regular' }]}>
            {submitError}
          </Text>
        ) : null}

        <Text style={[styles.disclaimer, { color: colors.mutedForeground, fontFamily: 'IBMPlexSans_400Regular' }]}>
          We respond within 1–2 business days. Your information is kept strictly confidential.
        </Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={fieldStyles.wrapper}>
      <View style={fieldStyles.labelRow}>
        <Text style={[fieldStyles.label, { color: colors.foreground, fontFamily: 'IBMPlexSans_500Medium' }]}>
          {label}
        </Text>
        {required && (
          <Text style={[fieldStyles.required, { color: colors.accent }]}>*</Text>
        )}
      </View>
      {children}
      {error && (
        <Text style={[fieldStyles.error, { color: colors.destructive, fontFamily: 'IBMPlexSans_400Regular' }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  label: { fontSize: 14 },
  required: { fontSize: 14 },
  error: { fontSize: 12, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, marginBottom: 4 },
  headerSub: { fontSize: 13, lineHeight: 18 },
  scrollContainer: { flex: 1 },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: 15, flex: 1 },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemText: { fontSize: 14, flex: 1 },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  submitError: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 24,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
