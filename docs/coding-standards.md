# Coding Standards & Architectural Best Practices

This document outlines the coding standards and architectural decisions for the Gym Tracker App project, specifically targeting the **React Native 0.76 (Expo SDK 52) + Gluestack UI v3** technology stack.

## Text Input Handling

Due to architectural changes in React Native 0.76 (New Architecture/Fabric) and the overhead of styling abstractions, we have adopted specific patterns to prevent UI jitter, input lag, and cursor jumps.

### The Problem

Binding `TextInput` values directly to parent state in complex forms causes expensive re-renders on every keystroke. This leads to:

- Input lag (typing feels sluggish).
- Cursor jumping to the end of the text.
- Character dropping during rapid typing.

### The Solution: Hybrid Ref Pattern

We use a **Hybrid Ref Pattern** for text inputs in forms.

1. **Local State for UI**: The input component itself manages its own `value` state to ensure 60fps responsiveness.
2. **Refs for Data**: The parent component uses `useRef` to store the aggregate form data. It does **not** re-render on every keystroke.
3. **Silent Updates**: The input component silently updates the parent's ref via a stable callback.

#### Example Implementation

**Parent Component:**

```typescript
const MyForm = () => {
  // 1. Use Refs for form data to avoid re-renders
  const formDataRef = useRef({ name: '', email: '' });

  // 2. Stable callback
  const handleNameChange = useCallback((text: string) => {
    formDataRef.current.name = text;
  }, []);

  return (
    <VStack>
      <OptimizedInput 
        initialValue={formDataRef.current.name}
        onValueChange={handleNameChange}
      />
      <Button onPress={() => submit(formDataRef.current)} />
    </VStack>
  );
};
```

**Optimized Input Component:**

```typescript
const OptimizedInput = memo(({ initialValue, onValueChange }) => {
  // 3. Local state for immediate UI feedback
  const [value, setValue] = useState(initialValue);

  const handleChange = (text) => {
    setValue(text); // Update UI
    onValueChange(text); // Update Parent Data (Silent)
  };

  return (
    <Input>
      <InputField value={value} onChangeText={handleChange} />
    </Input>
  );
});
```

### Critical Rules for Inputs

- **DO NOT** pass a state variable `value` from a complex parent directly to an input if that parent re-renders heavily.
- **DO** use `collapsable={false}` on View containers wrapping inputs if you experience focus loss (Fabric optimization side-effect).
- **DO** use `autoCorrect={false}` if you experience flickering during rapid typing.
- **DO** verify `nativewind` configuration to ensure styles are compiled effectively.

For a deep dive into the technical reasoning, see: [Text Input Optimization Report](./technical-insights/text-input-handling-rn76.md)
