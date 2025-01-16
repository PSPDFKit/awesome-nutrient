"use client";
import { useEffect, useRef, useState } from "react";
import { AnnotationTypeEnum, User } from "../utils/types";
const ActionButton = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.ActionButton),
  { ssr: false }
);
const Select = dynamic(
  () => import("@baseline-ui/core").then((mod) => mod.Select),
  { ssr: false }
);

import {
  handleAnnotatitonCreation,
  handleAnnotatitonDelete,
  TOOLBAR_ITEMS,
  getAnnotationRenderers,
  //updateSignHereWidget,
  initialsSVG,
  signSVG,
  personSVG,
  dateSVG,
} from "../utils/helpers";
import dynamic from "next/dynamic";

/**
 * SignDemo component.
 *
 * @param allUsers - An array of User objects representing all the users.
 * @param user - The currently logged-in user.
 * @returns The rendered SignDemo component.
 */
const SignDemo: React.FC<{ allUsers: User[]; user: User }> = ({
  allUsers,
  user,
}) => {
  const [PSPDFKit, setPSPDFKit] = useState<any>(null);
  //export const SignDemo: any = ({ allUsers, user }: { allUsers: User[], user: User }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<any>(null);

  // State to store the users. Master is the default user for now who can add fields in the doc.
  const [users, setUsers] = useState<User[]>(allUsers);

  const [isVisible, setIsVisible] = useState(
    user.role == "Editor" ? true : false
  );

  // State to store the current signee i.e the user who is currently selected for which the field will be added
  //@ts-ignore
  const [currSignee, setCurrSignee] = useState<User>(users.find((user) => user.role !== "Editor"));
  const currSigneeRef = useRef(currSignee);
  currSigneeRef.current = currSignee;

  // State to store the current user i.e the user who is currently selected / Loggedin
  const [currUser, setCurrUser] = useState<User>(user);
  const currUserRef = useRef(currUser);
  currUserRef.current = currUser;

  useEffect(() => {
    if (PSPDFKit) {
      allUsers.forEach((user) => {
        user.color = randomColor(PSPDFKit);
      });
    }
    setUsers(allUsers);
    setCurrUser(user);
    userChange(user, PSPDFKit);
  }, [user]);

  // State to store the current page index
  const [onPageIndex, setOnPageIndex] = useState<number>(0);
  const onPageIndexRef = useRef(onPageIndex);
  onPageIndexRef.current = onPageIndex;

  const [readyToSign, setReadyToSign] = useState<boolean>(false);

  // For Custom signature / initial field appearance
  const mySignatureIdsRef = useRef([]);
  const [signatureAnnotationIds, setSignatureAnnotationIds] = useState<
    string[]
  >([]);

  // For Custom Add Signature / Intitial field appearance
  const [sessionSignatures, setSessionSignatures] = useState<any>([]);
  const [sessionInitials, setSessionInitials] = useState<any>([]);

  function onDragStart(event: React.DragEvent<HTMLDivElement>, type: string) {
    const instantId = "PSPDFKit.generateInstantId()";
    let data =
      currSignee.name + // value from select, name of signer
      "%" + // % is an invalid email character so we can use it as a delimiter
      currSignee.email + // value from select, email of signer
      "%" +
      instantId +
      "%" +
      type;

    (event.target as HTMLDivElement).style.opacity = "0.8";
    const img = document.getElementById(`${type}-icon`);
    if (img) {
      event.dataTransfer.setDragImage(img, 10, 10);
    }
    event.dataTransfer.setData("text/plain", data);
    event.dataTransfer.dropEffect = "move";
  }

  function onDragEnd(event: React.DragEvent<HTMLDivElement>) {
    (event.target as HTMLDivElement).style.opacity = "1";
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: any, inst: any, PSPDFKit: any) => {
    e.preventDefault();
    e.stopPropagation();
    const dataArray = e.dataTransfer.getData("text").split("%");
    let [name, email, instantId, annotationType] = dataArray;
    instantId = PSPDFKit.generateInstantId();
    const signee = currSigneeRef.current;
    const user = currUserRef.current;
    const pageIndex = onPageIndexRef.current;
    const rectWidth = annotationType === AnnotationTypeEnum.INITIAL ? 70 : 120;
    const rectHeight =
      annotationType === AnnotationTypeEnum.SIGNATURE ||
      annotationType === AnnotationTypeEnum.INITIAL
        ? 60
        : 40;
    const clientRect = new PSPDFKit.Geometry.Rect({
      left: e.clientX - rectWidth / 2,
      top: e.clientY - rectHeight / 2,
      height: rectHeight,
      width: rectWidth,
    });
    const pageRect = inst.transformContentClientToPageSpace(
      clientRect,
      pageIndex
    ) as any;
    if (
      annotationType === AnnotationTypeEnum.SIGNATURE ||
      annotationType === AnnotationTypeEnum.INITIAL
    ) {
      const widget = new PSPDFKit.Annotations.WidgetAnnotation({
        boundingBox: pageRect,
        formFieldName: instantId,
        id: instantId,
        pageIndex,
        name: instantId,
        customData: {
          createdBy: user.id,
          signerID: signee.id,
          signerEmail: email,
          type: annotationType,
          signerColor: signee.color,
          isInitial: annotationType === AnnotationTypeEnum.INITIAL,
        },
        //backgroundColor: signee.color,
      });
      const formField = new PSPDFKit.FormFields.SignatureFormField({
        annotationIds: PSPDFKit.Immutable.List([widget.id]),
        name: instantId,
        id: instantId,
        readOnly: signee.id != user.id,
      });
      await inst.create([widget, formField]);
    } else {
      const text = new PSPDFKit.Annotations.TextAnnotation({
        pageIndex,
        boundingBox: pageRect,
        text: {
          format: "plain",
          value: annotationType === "name" ? name : new Date().toDateString(),
        },
        name: name,
        customData: {
          signerEmail: email,
          type: annotationType,
          signerColor: signee.color,
        },
        font: "Helvetica",
        fontSize: 14,
        horizontalAlign: "center",
        verticalAlign: "center",
        isEditable: false,
        backgroundColor: signee.color,
      });
      await inst.create(text);
    }
    // set the viewer to form creator mode so that the user can place the field
    // inst.setViewState((viewState) =>
    //   viewState.set("interactionMode", PSPDFKit.InteractionMode.FORM_CREATOR)
    // );

    // @ts-ignore
    inst.setOnAnnotationResizeStart((eve) => {
      if (eve.annotation instanceof PSPDFKit.Annotations.WidgetAnnotation) {
        return {
          //maintainAspectRatio: true,
          //responsive: false,
          maxWidth: 250,
          maxHeight: 100,
          minWidth: 70,
          minHeight: 30,
        };
      } else if (
        eve.annotation instanceof PSPDFKit.Annotations.TextAnnotation
      ) {
        return {
          //maintainAspectRatio: true,
          //responsive: false,
          maxWidth: 250,
          maxHeight: 100,
          minWidth: 70,
          minHeight: 30,
        };
      }
    });
  };

  const [isTextAnnotationMovable, setIsTextAnnotationMovable] = useState(false);
  const isTextAnnotationMovableRef = useRef(isTextAnnotationMovable);
  isTextAnnotationMovableRef.current = isTextAnnotationMovable;

  const onChangeReadyToSign = async (
    value: boolean,
    user: User,
    PSPDFKit: any
  ) => {
    if (instance) {
      setReadyToSign(value);
      if (user.role == "Editor") {
        if (value) {
          instance.setViewState((viewState: any) =>
            viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
          );
          setIsTextAnnotationMovable(false);
        } else {
          instance.setViewState((viewState: any) =>
            viewState.set(
              "interactionMode",
              PSPDFKit.InteractionMode.FORM_CREATOR
            )
          );
          setIsTextAnnotationMovable(true);
        }
      } else {
        instance.setViewState((viewState: any) =>
          viewState.set("interactionMode", PSPDFKit.InteractionMode.PAN)
        );
        setIsTextAnnotationMovable(false);
      }
    }
  };

  const addSignee = () => {
    if (typeof window !== "undefined") {
      const name = window.prompt("Enter signee's name:");
      const email = window.prompt("Enter signee's email:");

      let id = Math.floor(Math.random() * 1000000);
      while (id && users.find((user) => user.id === id)) {
        console.log("Non unique" + id);
        id = Math.floor(Math.random() * 1000000);
      }
      console.log("Unique id" + id);

      if (name && email) {
        setUsers((prevState) => [
          ...prevState,
          {
            // You can use your own logic to generate the id
            id: id,
            name: name,
            email: email,
            color: randomColor(PSPDFKit),
            role: "signee",
          } as User,
        ]);
      } else {
        alert("Please enter both name and email.");
      }
    }
  };

  // Function to get random color for the signee
  const randomColor = (PSPDFKit: any) => {
    const colors: any = [
      PSPDFKit.Color.LIGHT_GREY,
      PSPDFKit.Color.LIGHT_GREEN,
      PSPDFKit.Color.LIGHT_YELLOW,
      PSPDFKit.Color.LIGHT_ORANGE,
      PSPDFKit.Color.LIGHT_RED,
      PSPDFKit.Color.LIGHT_BLUE,
      PSPDFKit.Color.fromHex("#0ffcf1"),
    ];
    const usedColors = users.map((signee) => signee.color);
    const availableColors = colors.filter(
      (color: any) => !usedColors.includes(color as any)
    );
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
  };

  // Function to handle user change
  const userChange = async (user: User, PSPDFKit: any) => {
    setCurrUser(user);
    if (instance) {
      const formFields = await instance.getFormFields();
      const signatureFormFields = formFields.filter(
        (field: any) => field instanceof PSPDFKit.FormFields.SignatureFormField
      );
      const signatureAnnotations = async () => {
        let annotations: any[] = [];
        for (let i = 0; i < instance.totalPageCount; i++) {
          let ann = await instance.getAnnotations(i);
          ann.forEach((annotation: any) => {
            if (
              annotation.customData &&
              annotation.customData.signerID == user.id
            ) {
              annotations.push(annotation.id);
            }
          });
        }
        return annotations;
      };
      const userFieldIds = await signatureAnnotations();
      const readOnlyFormFields = signatureFormFields
        .map((it: any) => {
          if (userFieldIds.includes(it.id)) {
            return it.set("readOnly", false);
          } else {
            return it.set("readOnly", true);
          }
        })
        .filter(Boolean); // Filter out undefined values
      await instance.update(readOnlyFormFields);
      // User with role Editor can edit the document
      if (user.role == "Editor") {
        instance.setViewState((viewState: any) =>
          viewState.set("showToolbar", true)
        );
        setIsVisible(true);
        onChangeReadyToSign(false, user, PSPDFKit);
      } else {
        instance.setViewState((viewState: any) =>
          viewState.set("showToolbar", false)
        );
        setIsVisible(false);
        onChangeReadyToSign(true, user, PSPDFKit);
      }
    }
  };

  // Tracking whether add Signature/Initial UI
  let isCreateInitial: boolean = false;

  // Load PSPDFKit
  useEffect(() => {
    const container = containerRef.current;
    let PSPDFKit: any;
    (async function () {
      PSPDFKit = await import("pspdfkit");
      setPSPDFKit(PSPDFKit);
      if (container) {
        if (PSPDFKit) {
          PSPDFKit.unload(container);
        }
        const {
          UI: { createBlock, Recipes, Interfaces, Core },
        } = PSPDFKit;
        PSPDFKit.load({
          licenseKey: process.env.NEXT_PUBLIC_LICENSE_KEY as string,
          // @ts-ignore
          ui: {
            [Interfaces.CreateSignature]: ({ props }: any) => {
              return {
                content: createBlock(
                  Recipes.CreateSignature,
                  props,
                  ({ ui }: any) => {
                    if (isCreateInitial) {
                      ui.getBlockById("title").children = "Create Initial";
                      ui.getBlockById("save-signature-checkbox")._props.label =
                        "Save Initial";

                      const textInput = ui.getBlockById("signature-text-input");
                      textInput._props.placeholder = "Initial";
                      textInput._props.label = "Intial here";
                      textInput._props.clearLabel = "Clear initial";

                      const freehand = ui.getBlockById("freehand-canvas");
                      freehand._props.placeholder = "Intial here";
                      freehand._props.clearLabel = "Clear initial";

                      const fontselect = ui.getBlockById("font-selector");
                      if (fontselect._props.items[0].label == "Signature") {
                        fontselect._props.items = fontselect._props.items.map(
                          (item: any) => {
                            return { id: item.id, label: "Initial" };
                          }
                        );
                      }
                    }
                    return ui.createComponent();
                  }
                ).createComponent(),
              };
            },
          },
          container,
          document: "/document.pdf",
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
          toolbarItems: TOOLBAR_ITEMS,
          disableTextSelection: true,
          customRenderers: {
            Annotation: ({ annotation }: any) =>
              getAnnotationRenderers({
                annotation,
              }),
          },
          styleSheets: [`/viewer.css`],
          isEditableAnnotation: function (annotation:any) {
            return !annotation.isSignature;
          },
        }).then(async function (inst: any) {
          setInstance(inst);

          // **** Setting Page Index ****

          inst.addEventListener(
            "viewState.currentPageIndex.change",
            (page: any) => {
              setOnPageIndex(page);
            }
          );

          // **** Handle Drop event ****

          //@ts-ignore
          const cont = inst.contentDocument.host;
          cont.ondrop = async function (e: any) {
            await handleDrop(e, inst, PSPDFKit);
          };

          // **** Handling Add Signature / Initial UI ****

          // Track which signature form field was clicked on
          // and wether it was an initial field or not.
          inst.addEventListener("annotations.press", (event: any) => {
            let lastFormFieldClicked = event.annotation;

            let annotationsToLoad;
            if (
              lastFormFieldClicked.customData &&
              lastFormFieldClicked.customData.isInitial === true
            ) {
              annotationsToLoad = sessionInitials;

              isCreateInitial = true;
            } else {
              annotationsToLoad = sessionSignatures;

              isCreateInitial = false;
            }
            inst.setStoredSignatures(
              PSPDFKit.Immutable.List(annotationsToLoad)
            );

            if (
              !isTextAnnotationMovableRef.current &&
              event.annotation instanceof PSPDFKit.Annotations.TextAnnotation
            ) {
              //@ts-ignore
              event.preventDefault();
            }
          });
          let formDesignMode = !1;

          inst.setToolbarItems((items: any) => [
            ...items,
            { type: "form-creator" },
          ]);
          inst.addEventListener("viewState.change", (viewState: any) => {
            formDesignMode = viewState.formDesignMode === true;
          });

          inst.addEventListener(
            "storedSignatures.create",
            async (annotation: any) => {
              // Logic for showing signatures and intials in the UI
              if (isCreateInitial) {
                setSessionInitials([...sessionInitials, annotation]);
              } else {
                setSessionSignatures([...sessionSignatures, annotation]);
              }
            }
          );

          // **** Handling Signature / Initial fields appearance ****

          inst.addEventListener(
            "annotations.load",
            async function (loadedAnnotations: any) {
              for await (const annotation of loadedAnnotations) {
                await handleAnnotatitonCreation(
                  inst,
                  annotation,
                  mySignatureIdsRef,
                  setSignatureAnnotationIds,
                  currUser.email
                );
              }
            }
          );

          inst.addEventListener(
            "annotations.create",
            async function (createdAnnotations: any) {
              const annotation = createdAnnotations.get(0);
              await handleAnnotatitonCreation(
                inst,
                annotation,
                mySignatureIdsRef,
                setSignatureAnnotationIds,
                currUser.email
              );
            }
          );

          inst.addEventListener(
            "annotations.delete",
            async (deletedAnnotations: any) => {
              const annotation = deletedAnnotations.get(0);
              await handleAnnotatitonDelete(inst, annotation, currUser?.email);
              const updatedAnnotationIds = mySignatureIdsRef.current.filter(
                (id) => id !== annotation.id
              );
              setSignatureAnnotationIds(updatedAnnotationIds);
              mySignatureIdsRef.current = updatedAnnotationIds;
            }
          );
          inst.setViewState((viewState: any) =>
            viewState.set(
              "interactionMode",
              PSPDFKit.InteractionMode.FORM_CREATOR
            )
          );
          setIsTextAnnotationMovable(true);
          // const scrollElement =
          //   inst.contentDocument.querySelector(".PSPDFKit-Scroll");

          // if (scrollElement === null) console.log("Scroll element not found");

          // //@ts-ignore
          // scrollElement.addEventListener("scroll", updateSignHereWidget(inst));
          // // Update the "Sign Here" widget when someone signs
          // inst.addEventListener("annotations.change", () => {
          //   updateSignHereWidget(inst);
          // });
          // // Update widget with delay to make it visually pop
          // window.setTimeout(updateSignHereWidget, 1e3);

          // inst.exportInstantJSON().then((data) => {
          //   localStorage.setItem("document", JSON.stringify(data));
          // });
        });
      }
    })();
  }, []);

  const signeeChanged = (signee: User) => {
    setCurrSignee(signee);
    setSelectedSignee(signee);
  };

  const deleteUser = (user: User) => {
    let remainingUsers = users.filter((userL: User) => userL.id !== user.id);
    let currSig = users.find(
      (userL) => user !== userL && userL.role !== "Editor"
    );
    setUsers(remainingUsers);
    currSig ? signeeChanged(currSig) : alert("No Signee left");
  };
  const RedCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
    color,
  }) => {
    const jsonString = color
      ? color.substring(2).replace(/(\w+):/g, '"$1":')
      : "";
    try {
      // Parse the JSON string into an object
      const colorObject = JSON.parse(jsonString);
      //console.log("Color: ", colorObject);
      return (
        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="10"
            cy="10"
            r="10"
            fill={`rgb(${colorObject.r},${colorObject.g},${colorObject.b})`}
          />
        </svg>
      );
    } catch (error) {}
  };

  const [selectedSignee, setSelectedSignee] = useState(currSigneeRef.current);
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "top",
          position: "fixed",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "256px",
            background: "#ffffff",
            borderRight: "1px solid #F0F3F9",
            overflowY: "auto",
            height: "90vh",
            borderTop: "1px solid #D7DCE4",
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid #D7DCE4" }}>
            <h3
              style={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: "600",
                lineHeight: "20px",
                textTransform: "uppercase",
              }}
            >
              user
            </h3>
            <div
              style={{
                fontFamily: "Inter",
                fontSize: "10px",
                fontWeight: "400",
                lineHeight: "14px",
                marginBottom: "10px",
              }}
            >
              Choose &apos;Admin&apos; to edit and prepare the document for
              signing, or select a user to sign the document as that user.
            </div>
            <Select
              items={users.map((user) => {
                return {
                  id: user.id.toString(),
                  label:
                    user?.name.length > 15
                      ? user?.name.slice(0, 15) + "..."
                      : user?.name,
                  icon: () =>
                    user.role == "Editor" ? null : (
                      <RedCircleIcon color={user.color.toString()} />
                    ),
                } as any;
              })}
              className="input-custom-style"
              selectedKey={currUser.id.toString()}
              onSelectionChange={
                ((selected: any) => {
                  userChange(
                    users.find((user) => user.id == selected) as User,
                    PSPDFKit
                  );
                }) as any
              }
            />
          </div>
          {/* Side panel */}
          {isVisible && (
            <>
              <div
                style={{ padding: "16px", borderBottom: "1px solid #D7DCE4" }}
              >
                <h3
                  style={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: "600",
                    lineHeight: "20px",
                    textTransform: "uppercase",
                  }}
                >
                  Signers
                </h3>
                <div
                  style={{
                    fontFamily: "Inter",
                    fontSize: "10px",
                    fontWeight: "400",
                    lineHeight: "14px",
                    marginBottom: "10px",
                  }}
                >
                  Select the signer to assign fields to.
                </div>
                {/* Uncomment this to add ready to sign checkbox */}
                {/* <Checkbox
                  label="Ready to sign"
                  isSelected={readyToSign}
                  onChange={(e) => onChangeReadyToSign(e,currUser)}
                  style={{ margin: "0px 0px 25px 0px" }}
                /> */}
                <div>
                  <div>
                    {users?.map((user) => {
                      if (user.role !== "Editor") {
                        const isLastClicked = selectedSignee.id === user.id;
                        return (
                          <div
                            className={`heading-custom-style_hover ${
                              isLastClicked ? "highlight-signee" : ""
                            }`}
                            key={user?.id}
                            onClick={(e) => {
                              signeeChanged(user);
                            }}
                          >
                            <RedCircleIcon color={user.color?.toString()} />
                            {user?.name.length > 10
                              ? user?.name.slice(0, 10) + "..."
                              : user?.name}
                            <span
                              className="cross"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteUser(user);
                              }}
                            >
                              <svg
                                width="10"
                                height="9"
                                viewBox="0 0 10 9"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4.99991 5.43337L1.73324 8.70003C1.61102 8.82225 1.45547 8.88337 1.26658 8.88337C1.07769 8.88337 0.922133 8.82225 0.79991 8.70003C0.677688 8.57781 0.616577 8.42225 0.616577 8.23337C0.616577 8.04448 0.677688 7.88892 0.79991 7.7667L4.06658 4.50003L0.79991 1.23337C0.677688 1.11114 0.616577 0.955588 0.616577 0.766699C0.616577 0.57781 0.677688 0.422255 0.79991 0.300033C0.922133 0.17781 1.07769 0.116699 1.26658 0.116699C1.45547 0.116699 1.61102 0.17781 1.73324 0.300033L4.99991 3.5667L8.26658 0.300033C8.3888 0.17781 8.54435 0.116699 8.73324 0.116699C8.92213 0.116699 9.07769 0.17781 9.19991 0.300033C9.32213 0.422255 9.38324 0.57781 9.38324 0.766699C9.38324 0.955588 9.32213 1.11114 9.19991 1.23337L5.93324 4.50003L9.19991 7.7667C9.32213 7.88892 9.38324 8.04448 9.38324 8.23337C9.38324 8.42225 9.32213 8.57781 9.19991 8.70003C9.07769 8.82225 8.92213 8.88337 8.73324 8.88337C8.54435 8.88337 8.3888 8.82225 8.26658 8.70003L4.99991 5.43337Z"
                                  fill="#EF4444"
                                />
                              </svg>
                            </span>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
                <ActionButton
                  label={"+ Add New"}
                  size="md"
                  onPress={addSignee}
                  className="custom-button"
                  style={{ margin: "15px 0px 0px 0px" }}
                />
              </div>
              <div style={{ padding: "25px 15px" }}>
                <h3
                  style={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: "600",
                    lineHeight: "20px",
                    textTransform: "uppercase",
                  }}
                >
                  Add fields
                </h3>
                <div
                  style={{
                    fontFamily: "Inter",
                    fontSize: "10px",
                    fontWeight: "400",
                    lineHeight: "14px",
                    marginBottom: "10px",
                  }}
                >
                  Drag & drop fields on the document
                </div>
                {/* Uncomment this to add draggable name field */}
                <DraggableAnnotation
                  className="mt-5"
                  type={AnnotationTypeEnum.NAME}
                  label="Name"
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  userColor={currSignee.color}
                />
                <DraggableAnnotation
                  className="mt-5"
                  type={AnnotationTypeEnum.SIGNATURE}
                  label="Signature"
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  userColor={currSignee.color}
                />
                <DraggableAnnotation
                  className="mt-5"
                  type={AnnotationTypeEnum.INITIAL}
                  label="Initial"
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  userColor={currSignee.color}
                />
                {/* Uncomment this to add draggable date field */}
                <DraggableAnnotation
                  className="mt-5"
                  type={AnnotationTypeEnum.DATE}
                  label="Date"
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  userColor={currSignee.color}
                />
              </div>
            </>
          )}
        </div>
        {/* PSPDFKit div */}
        <div
          onDragOver={handleDragOver}
          ref={containerRef}
          style={{
            height: "90vh",
            width: "calc(100% - 256px)",
            borderTop: "1px solid #D7DCE4",
          }}
        />
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(SignDemo), { ssr: false });

// Red circle SVG icon as a React component

const DraggableAnnotation = ({
  className,
  type,
  label,
  onDragStart,
  onDragEnd,
  userColor,
}: {
  className: string;
  type: string;
  label: string;
  onDragStart: any;
  onDragEnd: any;
  userColor: any;
}) => {
  const id = `${type}-icon`;
  let icon = signSVG;
  switch (type) {
    case AnnotationTypeEnum.NAME:
      icon = personSVG;
      break;
    case AnnotationTypeEnum.SIGNATURE:
      icon = signSVG;
      break;
    case AnnotationTypeEnum.DATE:
      icon = dateSVG;
      break;
    case AnnotationTypeEnum.INITIAL:
      icon = initialsSVG;
      break;
    default:
      icon = signSVG;
      break;
  }

  return (
    <div
      draggable={true}
      onDragStart={async (e) => await onDragStart(e, type)}
      onDragEnd={(e) => onDragEnd(e, type)}
      style={{
        // display: "flex",
        margin: "15px 0px",
        padding: "0rem 0px",
        cursor: "move",
      }}
    >
      <div className="heading-custom-style">
        <span
          style={{
            border: "1px solid #d7dce4",
            borderRadius: "5px",
            marginInlineEnd: "8px",
            padding: "3px 5px",
            backgroundColor: userColor
              ? `rgb(${userColor.r},${userColor.g},${userColor.b})`
              : `white`,
          }}
        >
          {icon}
        </span>

        <span style={{ margin: "0px 0.5rem" }}>{label}</span>
      </div>
    </div>
  );
};
