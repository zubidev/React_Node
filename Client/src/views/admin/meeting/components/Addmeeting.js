import { Button, Flex, FormLabel, Grid, GridItem, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Radio, RadioGroup, Stack, Text, Textarea } from '@chakra-ui/react';
import { CUIAutoComplete } from 'chakra-ui-autocomplete';
import MultiContactModel from 'components/commonTableModel/MultiContactModel';
import MultiLeadModel from 'components/commonTableModel/MultiLeadModel';
import Spinner from 'components/spinner/Spinner';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { LiaMousePointerSolid } from 'react-icons/lia';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { MeetingSchema } from 'schema';
import { getApi, postApi } from 'services/api';

const AddMeeting = (props) => {
    const { onClose, isOpen, setAction, fetchData, leadContect, id, leadData } = props;
    const [leaddata, setLeadData] = useState([]);
    const [contactdata, setContactData] = useState([]);
    const [isLoding, setIsLoding] = useState(false);
    const [contactModelOpen, setContactModel] = useState(false);
    const [leadModelOpen, setLeadModel] = useState(false);
    const todayTime = new Date().toISOString().split('.')[0];
    const user = JSON.parse(localStorage.getItem('user'));

    const initialValues = {
        agenda: '',
        attendes: leadContect === 'contactView' && id ? [id] : [],
        attendesLead: leadContect === 'leadView' && id ? [id] : [],
        location: '',
        related: leadContect === 'contactView' ? 'Contact' : leadContect === 'leadView' ? 'Lead' : 'None',
        dateTime: '',
        notes: '',
        createBy: user?._id,
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: MeetingSchema,
        onSubmit: async (values, { resetForm }) => {
            setIsLoding(true);
            try {
                let response = await postApi('api/meeting/add', { ...values, moduleId: leadData?._id });
                if (response.status === 200) {
                    toast.success('Meeting added successfully');
                    resetForm();
                    onClose();
                    setAction((prev) => !prev);
                    if (fetchData) fetchData();
                } else {
                    toast.error('Failed to add meeting');
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to add meeting');
            } finally {
                setIsLoding(false);
            }
        },
    });

    const { errors, touched, values, handleBlur, handleChange, handleSubmit, setFieldValue } = formik;

    const countriesWithEmailAsLabel = (values.related === "Contact" ? contactdata : leaddata)?.map((item) => ({
        ...item,
        value: item._id,
        label: values.related === "Contact" ? `${item.firstName} ${item.lastName}` : item.leadName,
    }));

    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent height={"580px"}>
                <ModalHeader>Add Meeting</ModalHeader>
                <ModalCloseButton />
                <form onSubmit={handleSubmit}>
                    <ModalBody overflowY={"auto"} height={"400px"}>
                        <MultiContactModel data={contactdata} isOpen={contactModelOpen} onClose={setContactModel} fieldName='attendes' setFieldValue={setFieldValue} />
                        <MultiLeadModel data={leaddata} isOpen={leadModelOpen} onClose={setLeadModel} fieldName='attendesLead' setFieldValue={setFieldValue} />

                        <Grid templateColumns="repeat(12, 1fr)" gap={3}>
                            {/* Agenda Field */}
                            <GridItem colSpan={12}>
                                <FormLabel>Agenda<Text color={"red"}>*</Text></FormLabel>
                                <Input name="agenda" onChange={handleChange} onBlur={handleBlur} value={values.agenda} placeholder="Agenda" />
                                <Text color="red">{errors.agenda && touched.agenda && errors.agenda}</Text>
                            </GridItem>

                            {/* Related To */}
                            <GridItem colSpan={12}>
                                <FormLabel>Related To<Text color={"red"}>*</Text></FormLabel>
                                <RadioGroup onChange={(e) => setFieldValue('related', e)} value={values.related}>
                                    <Stack direction='row'>
                                        <Radio value='Contact'>Contact</Radio>
                                        <Radio value='Lead'>Lead</Radio>
                                    </Stack>
                                </RadioGroup>
                            </GridItem>

                            {/* Select Attendees */}
                            {(values.related === "Contact" ? contactdata : leaddata)?.length > 0 && (
                                <GridItem colSpan={12}>
                                    <CUIAutoComplete
                                        label={`Choose ${values.related}`}
                                        items={countriesWithEmailAsLabel}
                                        selectedItems={countriesWithEmailAsLabel?.filter(item =>
                                            (values.related === 'Contact' ? values.attendes : values.attendesLead).includes(item._id)
                                        )}
                                        onSelectedItemsChange={({ selectedItems }) => {
                                            const ids = selectedItems.map((item) => item._id);
                                            values.related === 'Contact' ? setFieldValue('attendes', ids) : setFieldValue('attendesLead', ids);
                                        }}
                                    />
                                    <IconButton onClick={() => values.related === 'Contact' ? setContactModel(true) : setLeadModel(true)} icon={<LiaMousePointerSolid />} />
                                </GridItem>
                            )}

                            {/* Other fields */}
                            <GridItem colSpan={12}><FormLabel>Location</FormLabel><Input name="location" onChange={handleChange} value={values.location} /></GridItem>
                            <GridItem colSpan={12}><FormLabel>Date & Time<Text color={"red"}>*</Text></FormLabel><Input type="datetime-local" name="dateTime" min={dayjs(todayTime).format('YYYY-MM-DD HH:mm')} onChange={handleChange} value={values.dateTime} /></GridItem>
                            <GridItem colSpan={12}><FormLabel>Notes</FormLabel><Textarea name="notes" onChange={handleChange} value={values.notes} /></GridItem>
                        </Grid>
                    </ModalBody>
                    <ModalFooter>
                        <Button type="submit" colorScheme="blue" mr={3} isLoading={isLoding}>Save</Button>
                        <Button onClick={() => { formik.resetForm(); onClose(); }} colorScheme="red">Close</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default AddMeeting;
