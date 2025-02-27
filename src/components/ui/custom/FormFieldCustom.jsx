import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const FormFieldCustom = (props) => {
  const { containerClassName, control, label = "", name, children } = props;

  return (
    <div className={containerClassName}>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className='flex flex-col gap-y-2'>
            {label && <FormLabel className="!text-black">{label}</FormLabel>}
            {children(field)}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default FormFieldCustom;